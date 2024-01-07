const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const port = 3000;
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const createUser = (token, email, given_name, family_name, name, nickname, password) => {
    const userOptions = {
        method: 'POST',
        url: `https://${process.env.DOMAIN}/api/v2/users`,
        headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            email,
            given_name,
            family_name,
            name,
            nickname,
            password,
            connection: 'Username-Password-Authentication',
        }),
    }

    request(tokenOptions, (error, response, body) => {
        if (error) {
            console.error('Error in createUser:', error);
            throw error;
        }
        console.log('User is created!', response.body);
        return response;
    });
};

const loginUser = (login, password) => {
    const tokenOptions = {
        method: 'POST',
        url: `https://${process.env.DOMAIN}/oauth/token`,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        form: {
            grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
            audience: process.env.AUDIENCE,
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            username: login,
            password: password,
            scope: 'offline_access',
            realm: 'Username-Password-Authentication',
        },
    };

    request(tokenOptions, (error, response, body) => {
        if (error) {
            console.error('Error in loginUser:', error);
            throw error;
        }
        console.log('Login completed!', response.body);
        return response;
    });
};

const getApplicationToken = () => {
    const getAppToken = {
        method: 'POST',
        url: `https://${process.env.DOMAIN}/oauth/token`,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        form: {
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            audience: process.env.AUDIENCE,
            grant_type: 'client_credentials',
        },
    };

    request(getAppToken, (error, response, body) => {
        if (error) {
            console.error('Error in getApplicationToken:', error);
            throw error;
        }
        const data = JSON.parse(response.body);
        process.env.ACCESS_TOKEN = data.access_token;
    });
};

const refreshToken = (refreshToken) => {
    const refreshTokenOptions = {
        method: 'POST',
        url: `https://${process.env.DOMAIN}/oauth/token`,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        form: {
            grant_type: 'refresh_token',
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            refresh_token: refreshToken,
        },
    };

    request(refreshTokenOptions, (error, response, body) => {
        if (error) {
            console.error('Error in refreshToken:', error);
        }
        console.log('Refresh token: ', response.body);
        return response.body;
    });
};

app.get('/', (req, res) => {
    if (req.username) {
        return res.json({
            username: req.username,
            logout: 'http://localhost:3000/logout'
        })
    }
    res.sendFile(path.join(__dirname+'/index.html'));
});

app.get('/signup', (req, res) => {
    if (req.username) {
        return res.json({
            username: req.username,
            logout: 'http://localhost:3000/logout'
        })
    }
    res.sendFile(path.join(__dirname+'/signup.html'));
});

app.get('/logout', (req, res) => {
    res.redirect('/');
});

app.get('/api/login', (_, res) => {
    const domain = process.env.AUTH0_DOMAIN;
    const id = process.env.CLIENT_ID;
    const redUri = encodeURIComponent('http://localhost:3000');
    const resType = 'code';
    const resMode = 'query';

    const authUrl = `${domain}?client_id=${id}&redirect_uri=${redUri}&response_type=${resType}&response_mode=${resMode}`;

    res.redirect(authUrl);
});

app.post('/api/login', (req, res) => {
    const { login, password } = req.body;
    loginUser(login, password);
});

app.get('/signup', (req, res) => {
    if (req.username) {
        return res.json({
            username: req.username,
            logout: 'http://localhost:3000/logout'
        })
    }
    res.sendFile(path.join(__dirname+'/signup.html'));
});

app.post('/api/signup', (req, res) => {
    const { email, given_name, family_name, name, nickname, password } = req.body;
    createUser(process.env.ACCESS_TOKEN, email, given_name, family_name, name, nickname, password);    
});

getApplicationToken();

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})