'use strict';
var jwt = require('jsonwebtoken');
var secrets = require('./secrets');

function tokenOptions(expiresIn, userId, clientId) {
    return {
        expiresIn: expiresIn,
        subject: userId, 
        audience: clientId
    };
}

module.exports = {
    parseAuthorizationHeader: (authHeader) => {
        return new Promise((resolve, reject) => {
            let token = '';
            if (authHeader) {
                let parts = authHeader.split(' ');
                if (parts.length == 2) {
                    let scheme = parts[0];
                    let credentials = parts[1];

                    if (/^Bearer$/i.test(scheme)) {
                        token = credentials;
                    } else {
                        return reject({ name: 'credentials_bad_scheme', message: 'Format is Authorization: Bearer [token]' });
                    }
                } else {
                    return reject({name: 'credentials_bad_format', message: 'Format is Authorization: Bearer [token]' });
                }
            } else { 
                return reject({name: 'no_header', message: 'no authorization header found'});
            }

            return resolve(token);
        });
    },
    getTimeRemaining: (token, secret) => {
        try {
            let decoded = jwt.verify(token, secret);
            return Promise.resolve(decoded.exp - Math.floor(Date.now() / 1000));
        } catch(err) {
            if (err.name == 'TokenExpiredError') {
                return Promise.resolve(0);
            } else {
                return Promise.reject(err);
            }
        }
    },
    createRefreshToken: (userId, clientId, apiId, expiration) => {
        let secret = secrets.apiIdDigest(apiId);
        return jwt.sign({ type: 'refresh' }, secret, tokenOptions(expiration, userId, clientId));
    },
    createAccessToken: (userId, clientId, apiId, expiration) => {
        let secret = secrets.apiIdDigest(apiId);
        return jwt.sign({ type: 'access' }, secret, tokenOptions(expiration, userId, clientId));
    }
};