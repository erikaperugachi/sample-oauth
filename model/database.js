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
  user: 'users:%s'
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
 * Add user.
 */
 
module.exports.addUser = (username, password) => {
  return db.hmsetAsync(fmt(formats.user, username),
    {
      id: username,
      username: username,
      password: password
    })
    .then(function(result) {
      return result;
    });
};

/**
 * Get client.
 */

module.exports.getClient = function(clientId) {
  return db.hgetallAsync(fmt(formats.client, clientId))
    .then(function(client) {
      if (!client) {
        return;
      }

      return {
        clientId: client.id,
        name: client.name
      };
    });
};