const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const port = 3000;
const jwt = require("jsonwebtoken");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const SESSION_KEY = 'Authorization';
const JWT_SECRET_KEY = "jwt_secret_key";

const verify = token => {
    if (!token) return null;

    try {
        const data = jwt.verify(token, JWT_SECRET_KEY);
        if (!data.login) {
            return null;
        }
        return data.username;
    } catch (error) {
        return null;
    }
}

app.use((req, res, next) => {
    let sessionId = req.get(SESSION_KEY);
    req.username = verify(sessionId);
    req.sessionId = sessionId;
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

const users = [
    {
        login: 'Login',
        password: 'Password',
        username: 'Username',
    },
    {
        login: 'Login1',
        password: 'Password1',
        username: 'Username1',
    }
]

app.post('/api/login', (req, res) => {
    const { login, password } = req.body;

    const user = users.find((user) => {
        if (user.login == login && user.password == password) {
            return true;
        }
        return false
    });

    if (user) {
        const data = { 
            username: user.username, 
            login: user.login 
        };

        const token = jwt.sign(
            data,
            JWT_SECRET_KEY,
            { expiresIn: '24h' }
        );

        return res.json({ token });
    }

    res.status(401).send();
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});
