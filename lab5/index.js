const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = 3000;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const { createUser, loginUser, getApplicationToken } = require('./authService')

const getKey = () => {
    return new Promise((resolve, reject) => {
        request(`https://${process.env.DOMAIN}/pem`, (err, res, body) => {
            if (err) {
                reject(err);
            } else {
                resolve(body);
            }
        });
    });
};

const verify = async () => {
    try {
        const token = process.env.ACCESS_TOKEN;
        const key = await getKey();
        const decoded = jwt.verify(token, key);
        console.log(key);
        console.log(decoded);
        return decoded;
    } catch (error) {
        console.error('Invalid token:', error.message);
        throw error;
    }
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

app.post('/api/login', async (req, res) => {
    const { login, password } = req.body;
    loginUser(login, password);
});

app.post('/api/signup', async (req, res) => {
    const { email, given_name, family_name, name, nickname, password } = req.body;
    createUser(token, email, given_name, family_name, name, nickname, password);    
});

app.use(verify);

getApplicationToken();

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})



