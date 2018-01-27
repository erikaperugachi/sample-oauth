/**
 * Module dependencies.
 */

var db = require('./conf').db;
var fmt = require('util').format;

/**
 * Redis formats.
 */

var formats = {
  client: 'clients:%s',
  token: 'tokens:%s',
  user: 'users:%s',
  authcode: 'authcode:%s',
  grantTypes: 'clients:%s:grant_types'
};

module.exports.grantTypeAllowed = (clientId, grantType) => {
  return db.sismemberAsync(fmt(formats.grantTypes, clientId), grantType);
};

/**
 * Get user.
 */

module.exports.getUser = (username, password) => {
  return db.hgetallAsync(fmt(formats.user, username))
    .then(function(user) {
      if (!user || password !== user.password) {
        return;
      }

      return {
        id: username
      };
    });
};

/**
 * Get authorization code.
 */

module.exports.getAuthorizationCode = (authorizationCode) => {
  return db.hgetallAsync(fmt(formats.authcode, authorizationCode))
    .then(function(code){
      if (!code) {
        return;
      }
      return {
        code: code.authorizationCode,
        scope: code.scope,
        expiresAt: new Date(code.expiresAt),
        redirectUri: code.redirectUri,
        client: {id: code.clientId},
        user: {id: code.userId}
      };
    });
}

/**
 * Save authorization code.
 */

module.exports.saveAuthorizationCode = (Code, Client, User) => {
  var data = {
    authorizationCode: Code.authorizationCode,
    scope: Code.scope,
    expiresAt: Code.expiresAt,
    redirectUri: Code.redirectUri,
    clientId: Client.id,
    userId: User.id
  }

  return db.hmsetAsync(fmt(formats.authcode, Code.authorizationCode), data)
    .then(function(res){
      if (res !== 'OK'){
        return;
      }
      return data;
    });
}

/**
 * Revoke authorization code.
 */

module.exports.revokeAuthorizationCode = (AuthorizationCode) => {
  return db.delAsync(fmt(formats.authcode, AuthorizationCode.code))
    .then(function(res){
      return res;
    });
}

/**
 * Get access token.
 */

module.exports.getAccessToken = (bearerToken) => {
  return db.hgetallAsync(fmt(formats.token, bearerToken))
    .then(function(token) {
      if (!token) {
        return;
      }

      return {
        accessToken: token.accessToken,
        client: {id: token.clientId},
        accessTokenExpiresAt: new Date(token.accessTokenExpiresAt),
        user: {id: token.userId}
      };
    });
};

/**
 * Get client.
 */

module.exports.getClient = (clientId, clientSecret) => {
  return db.hgetallAsync(fmt(formats.client, clientId))
    .then(function(client) {
      if (!client || (clientSecret !== null && client.clientSecret !== clientSecret)) {
        return;
      }
      return {
        id: client.id,
        grants: [client.grants],
        redirectUris: [client.redirectUri]
      };
    });
};

/**
 * Get refresh token.
 */

module.exports.getRefreshToken = (bearerToken) => {
  return db.hgetall(fmt(formats.token, bearerToken))
    .then(function(token) {
      if (!token) {
        return;
      }

      return {
        clientId: token.clientId,
        expires: token.refreshTokenExpiresOn,
        refreshToken: token.accessToken,
        userId: token.userId
      };
    });
};

/**
 * Save token.
 */

module.exports.saveToken = (token, client, user) => {
  var data = {
    accessToken: token.accessToken,
    accessTokenExpiresAt: token.accessTokenExpiresAt,
    clientId: client.id,
    refreshToken: token.refreshToken,
    refreshTokenExpiresAt: token.refreshTokenExpiresAt,
    userId: user.id
  };
  return Promise.all([
    db.hmset(fmt(formats.token, token.accessToken), data),
    db.hmset(fmt(formats.token, token.refreshToken), data)
  ]).then(function(res){
    if(res[0] && res[1]){
      data.user = {id: user.id};
      data.client = {id: client.id};
      return data;
    }else{
      return; 
    }
  });
};
