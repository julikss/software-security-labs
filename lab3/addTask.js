const request = require('request');
require('dotenv').config();

const getAppToken = {
    method: 'POST',
    url: `https://${process.env.DOMAIN}/oauth/token`,
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    form: {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        audience: process.env.AUDIENCE,
        grant_type: 'client_credentials'
    },
   
};

request(getAppToken, function (error, response, body) {
    if (error) {
        console.error('Error in request:', error);
        return;
    }

    const data = JSON.parse(body);
    console.log(data.access_token);
    changePswd(data.access_token);
   
});

const changePswd = applicationToken => {
    const pswdChangeOptions = {
        method: 'PATCH',
        url: `https://${process.env.DOMAIN}/api/v2/users/${process.env.USER_ID}`,
        headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${applicationToken}`
        },
        body: JSON.stringify ({
            "password": "Parol!123",
            "connection": "Username-Password-Authentication",
        })
    };
    
    return request(pswdChangeOptions, function (error, response, body) {
        if (error) {
            console.error('Error in request:', error);
            return;
        }
    
        console.log('Your password is updated!');
    });    
};
