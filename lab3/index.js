const request = require('request');
require('dotenv').config();

const tokenOptions = { 
    method: 'POST',
    url: `https://${process.env.DOMAIN}/oauth/token`,
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    form: {
        grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
        audience: process.env.AUDIENCE,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        username: 'julie.lehenka@gmail.com',
        password: 'Qwrt!123',
        scope: 'offline_access', 
        realm: 'Username-Password-Authentication',
    }
};

request(tokenOptions, function (error, response, body) {
    if (error) {
        console.error('Error in request:', error);
        return;
    }

    console.log('1)\n', body);
});

const refreshTokenOptions = { 
    method: 'POST',
    url: `https://${process.env.DOMAIN}/oauth/token`,
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    form: {
        grant_type: 'refresh_token',
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        refresh_token: 'mSorEZFBgSCCA8Pn9zMvI_CvtDlltLWjvuT4clBz03Gck'
    }
};

request(refreshTokenOptions, function (error, response, body) {
    if (error) {
        console.error('Error in request:', error);
        return;
    }

    console.log('2)\n', body);
});