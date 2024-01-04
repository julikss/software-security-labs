const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const port = 3000;
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const SESSION_KEY = 'Authorization';

const createUser = async (token, email, given_name, family_name, name, nickname, password) => {
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
    };

    try {
        const response = await makeRequest(userOptions);
        console.log('User is created!', response.body);
    } catch (error) {
        console.error('Error in createUser:', error);
    }
};

const loginUser = async (login, password) => {
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

    try {
        const response = await makeRequest(tokenOptions);
        console.log('Login completed!', response.body);
    } catch (error) {
        console.error('Error in loginUser:', error);
    }
};

const getApplicationToken = async () => {
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

    try {
        const response = await makeRequest(getAppToken);
        const data = JSON.parse(response.body);
        console.log('Application token: ', data.access_token);
        return data;
    } catch (error) {
        console.error('Error in getApplicationToken:', error);
        throw error;
    }
};

const refreshToken = async (refreshToken) => {
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

    try {
        const response = await makeRequest(refreshTokenOptions);
        console.log('Refresh token: ', response.body);
    } catch (error) {
        console.error('Error in refreshToken:', error);
    }
};

const makeRequest = (options) => {
    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                resolve({ response, body });
            }
        });
    });
};

app.use((req, res, next) => {
    let data = req.get(SESSION_KEY);
    if (data) {
        let token = JSON.parse(data);
        refreshToken(token);
    }
    next();
});

app.get('/', (req, res) => {
    if (req.username) {
        return res.json({
            username: req.username,
            logout: 'http://localhost:3000/logout'
        })
    }
    res.sendFile(path.join(__dirname+'/index.html'));
})

app.get('/logout', (req, res) => {
    res.redirect('/');
});

app.post('/api/login', async (req, res) => {
    const { login, password } = req.body;
    await loginUser(login, password);
});

app.get('/signup', (req, res) => {
    if (req.username) {
        return res.json({
            username: req.username,
            logout: 'http://localhost:3000/logout'
        })
    }
    res.sendFile(path.join(__dirname+'/signup.html'));
})

app.post('/api/signup', async (req, res) => {
    const { email, given_name, family_name, name, nickname, password } = req.body;

    try {
        const tokenData = await getApplicationToken();
        const { access_token: token } = tokenData;
        
        if (!token) {
            return res.status(401).json({ error: 'No token' });
        }

        createUser(token, email, given_name, family_name, name, nickname, password);
        return res.status(200).json({ message: 'Registration is successful' });
    } catch (error) {
        console.error('Error in signup:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})