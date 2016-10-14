'use strict';

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
                        return reject({ error: 'credentials_bad_scheme', message: 'Format is Authorization: Bearer [token]' });
                    }
                } else {
                    return reject({error: 'credentials_bad_format', message: 'Format is Authorization: Bearer [token]' });
                }
            } else { 
                return reject({error: 'no_header', message: 'no authorization header found'});
            }

            return resolve(token);
        });
    }
};