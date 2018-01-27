const db = require('../model/model');
const sendResponse = require('./util').sendResponse;

module.exports.addUser = (req, res) => {
  console.log(`user: addUser: req.body is:`, req.body);
  
  const username = req.body.username;
  const password = req.body.password;
  
  db.getUser(username, password).then(function(user){
    if(user){
      throw new Error('User already exists');
    }else{
      return db.addUser(username, password);
    }
  }).then(function(result){
    return sendResponse(res, result, null);
  }).catch(function(error){
    const message = 'Failed to register user';
    return sendResponse(res, message, error.message);
  });
}