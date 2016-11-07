'use strict';
var AWS = require('aws-sdk');
var jwt = require('jsonwebtoken');
var log = require('./log');
var config = require(`../config/${process.env.NODE_ENV}.json`);
var uuid = require('uuid');
var secrets = require('./secrets');

var docClient = new AWS.DynamoDB.DocumentClient();

const REFRESH_TOKEN_TABLE = config.RefreshTokenTable;
const USER_TABLE = config.UsersTable;

//NOTE: the role associated with the client Lambda function needs to have "AmazonDynamoDBFullAccess" priveledges
module.exports = {
    //NOTE: issueDate and expirationDate are encoded within the token - is it necassary to store separately in db?    
    saveTokens: function(refreshToken, accessToken, userId, clientId) {
        let decodedRToken = jwt.decode(refreshToken);

        return new Promise((resolve, reject) => {
            let params = {
                TableName: REFRESH_TOKEN_TABLE,
                Item: {
                    RefreshToken: refreshToken,
                    PrincipalId: userId,
                    AccessToken: accessToken,
                    ClientId: clientId,
                    IssuedAt: decodedRToken.iat,
                    ExpiresAt: decodedRToken.exp,
                    SessionCreatedAt: decodedRToken.iat
                }
            };

            docClient.put(params, (err, data) => {
                if (err) return reject(err);

                resolve(data);
            });
        });
    },
    saveUser: function(profileData, clientId) {

        if(!profileData.account_type) {
            return Promise.reject('account_type was not provided');
        }

        if(!clientId) {
            return Promise.reject('clientId not provided');
        }

        let dateCreated = Math.floor(Date.now() / 1000);
        let dateModified = dateCreated;
        let id = '';

        if(profileData.account_type === 'traditional') {
            id = `${uuid.v4()}|${profileData.account_type}`;
        } else if (!!profileData.id) {
            id = `${profileData.id}|${profileData.account_type}`;
        } else {
            return Promise.reject(`no id provided for ${profileData.account_type} account_type`);
        }

        //TODO: add other interesting profile data to this item
        let item = {
            Id: id,
            ClientId: clientId,
            Type: profileData.account_type,
            Email: profileData.email,
            DateCreated: dateCreated,
            DateModified: dateModified
        };

        if (!!profileData.password) {
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
    },
    getUser: function(profileData) {
        let params = { TableName: USER_TABLE };
        if (!!profileData.id && !!profileData.account_type) {
            params.Key = { Id: `${profileData.id}|${profileData.account_type}` };
        } else if (!!profileData.email) {            
            params.IndexName = 'Email-index';
            params.KeyConditionExpression = '#hashkey = :hk_val';
            params.ExpressionAttributeNames = { '#hashkey': 'Email' };
            params.ExpressionAttributeValues = { ':hk_val': profileData.email };
        } else {
            return Promise.reject('incomplete profile data: id + account_type or email required');
        }

        return new Promise((resolve, reject) => {            
            docClient.query(params, (err, data) => {
                if (err) return reject(err);

                if (data.Items.length == 1) {
                    resolve(data.Items[0]);
                } else {
                    resolve({});
                }
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
    }
    */

};
