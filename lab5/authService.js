const request = require('request');
require('dotenv').config();

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
    };

    try {
        const response = makeRequest(userOptions);
        console.log('User is created!', response.body);
        return response;
    } catch (error) {
        console.error('Error in createUser:', error);
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

module.exports = {
    createUser,
    loginUser,
    getApplicationToken
}