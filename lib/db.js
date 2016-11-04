'use strict';
var AWS = require('aws-sdk');
var log = require('./log');
var config = require(`../config/${process.env.NODE_ENV}.json`);
var uuid = require('uuid');
var secrets = require('./secrets');

var docClient = new AWS.DynamoDB.DocumentClient();

const REFRESH_TOKEN_TABLE = config.RefreshTokenTable;
const USER_TABLE = config.UsersTable;

//NOTE: the role associated with the client Lambda function needs to have "AmazonDynamoDBFullAccess" priveledges
module.exports = {
    /*
    //NOTE: issueDate and expirationDate are encoded within the token - is it necassary to store separately in db?
    saveRefreshToken: function(refreshToken, currentAccessToken, principleId, clientId, issueDate, expirationDate, sessionCreatedAtDate) {
        if (arguments.length < 7) return Promise.reject('not enough arguments');
        //TODO: other validations on arguments??
        return new Promise((resolve, reject) => {
            let params = {
                TableName: REFRESH_TOKEN_TABLE,
                Item: {
                    RefreshToken: refreshToken,
                    PrincipleId: principleId,
                    AccessToken: currentAccessToken,
                    ClientId: clientId,
                    IssuedAt: issueDate,
                    ExpiresAt: expirationDate,
                    SessionCreatedAt:sessionCreatedAtDate
                }
            };

            docClient.put(params, (err, data) => {
                if (err) return reject(err);

                resolve(data);
            });
        });
    },
    */
    saveUser: function(profileData, clientId) {
        let dateCreated = Math.floor(Date.now() / 1000);
        let dateModified = dateCreated;
        let id = '';

        if(profileData.accountType === 'traditional') {
            id = `${uuid.v4()}|${profileData.accountType}`;
        } else if (profileData.accountType === 'facebook') {
            //TODO: implement this - verify access_token via FB Open Graph
        } else {
            return Promise.reject(new Error('New account type not recognized'));
        }

        //TODO: add other interesting profile data to this item
        let item = {
            Id: id,
            ClientId: clientId,
            Type: profileData.accountType,
            UserName: profileData.userName,
            DateCreated: dateCreated,
            DateModified: dateModified
        };

        if (profileData.password) {
            item.Password = secrets.passwordDigest(profileData.password);
        }

        return new Promise((resolve, reject) => {
            let params = {
                    TableName: USER_TABLE,
                    Item: item
                };

                docClient.put(params, (err, data) => {
                    if (err) return reject(err);

                    resolve(data);
                });
            });   
    }
    /*,
    getRefreshToken: function(refreshToken) {
        return new Promise((resolve, reject) => {
            let params = {
                    TableName: REFRESH_TOKEN_TABLE,
                    Key: {"RefreshToken": refreshToken}
                };
            log.info(params);
            try {    
                    docClient.get(params, (err, data) => {
                        log.info(err);
                        log.info(data);
                        if (err) return reject(err);
                        resolve(data);
                    });
               } catch (err) {
                    return reject(err);
                }     
            });   
    },
    deleteRefreshToken: function(refreshToken) {
        return new Promise((resolve, reject) => {
            let params = {
                    TableName: REFRESH_TOKEN_TABLE,
                    Key: {"RefreshToken": refreshToken}
                };
                log.info(params);
                docClient.delete(params, (err, data) => {
                    log.info(err);
                    log.info(data);
                    if (err) return reject(err);
                    resolve(data);
                });
            });   
    },
    getUser: function(principleId,clientId) {
        log.info(principleId+':'+clientId);
        return new Promise((resolve, reject) => {
            let params = {
                    TableName: USER_TABLE,
                    Key: {
                        PrincipleId: principleId
                    }
                };

                docClient.get(params, (err, data) => {
                    if (err) return reject(err);

                    resolve(data);
                });
            });   
    }
    */

};
