/**
 * Module dependencies.
 */

var client = require('redis').createClient();
var db = require('bluebird').promisifyAll(client);
var fmt = require('util').format;

module.exports.client = client;
module.exports.db = db;