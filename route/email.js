const db = require('../model/database');
const sendResponse = require('./util').sendResponse;
const request = require('request');

module.exports.email = (req, res) => {
  console.log(`auth: email: req.query is:`, req.query);
  return sendResponse(res, {data: 'info xxx'}, null);
}
