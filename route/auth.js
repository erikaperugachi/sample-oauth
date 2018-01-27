const db = require('../model/database');
const sendResponse = require('./util').sendResponse;
const request = require('request');

module.exports.form = (req, res) => {
  console.log(`auth: form: req.query is:`, req.query);
  return res.render('auth/login');
}

module.exports.auth = (req, res, next) => {
  console.log(`auth: auth: req.query is:`, req.query);

  if(!req.session.query){
    req.session.query = {
      response_type: req.query.response_type,
      client_id: req.query.client_id,
      redirect_uri: req.query.redirect_uri,
      scope: req.query.scope,
      state: req.query.state
    }
  }

  if (req.session.user) {
    db.getClient(req.session.query.client_id).then(function(client){
      if(client){
        return res.render('auth/auth', {user: req.session.user, client: client});
      }else{
        throw new Error('client_id does not exists');
      }
    }).catch(function(error){
      const message = 'Failed to authorize app';
      return sendResponse(res, message, error.message);
    });
  } else {
    return res.redirect(`login`);
  }
}

module.exports.login = (req, res) => {
  console.log(`auth: login: req.body is:`, req.body);

  const username = req.body.username;
  const password = req.body.password;
  
  db.getUser(username, password).then(function(user){
    if(user){
      req.session.user = user;
      return res.redirect('/oauth/authorize');
    }else{
      throw new Error('Error to username or password');
    }
  }).catch(function(error){
    const message = 'Failed to login user';
    return sendResponse(res, message, error.message);
  });
}

module.exports.loadCurrentUser = (req) => {
  console.log(`auth: loadCurrentUser: req.body is:`, req.body);
  
  return req.session.user;
}

module.exports.decision = (req, res, next) => {
  console.log(`auth: decision: req.body is:`, req.body);
  
  req.body = req.session.query;
  req.session.query = null;
  
  next();
}

