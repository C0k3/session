module.exports = {
  RefreshTokenTable: 'patrick-KODemoTokens',
  UsersTable: 'patrick-KODemoUsers',
  RefreshTokenExpiration: '30 days',
  AccessTokenExpiration: '1h',
  LogLevel: 'debug',
  DynamoDB: {
    access_key: 'test',
    secret_key: 'test',
    region: 'us-east-1',
    endpoint: 'https://dynamodb.us-east-1.amazonaws.com'
  },
//NOTE: DO NOT STORE SALT IN CODE --> this is for demo puposes only
//in production consider an encrypted value in code and store the decryption key in AWS KMS
  ApiIdSalt: '{apiId_salt}',
  PasswordSalt: '{password_salt}'
}