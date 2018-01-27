const express = require('express');
const bodyParser = require('body-parser');

const session = require('express-session');
const RedisStore = require('connect-redis')(session);

const model = require('./model/model');
const client = require('./model/database').client;
const oauthServer = require('express-oauth-server');

const user = require('./route/user');
const auth = require('./route/auth');
const email = require('./route/email');

// Create an Express application.
var app = express();

// Add body parser.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Set the view engine to ejs
app.set('view engine', 'ejs');
app.set('view options', { layout: true });
app.set('views', __dirname + '/views');

// Session store
app.use(session({
  secret: 'keyServerSession',
  store: new RedisStore({
    host: 'localhost',
    port: 6379,
    client: client
  }),
  saveUninitialized: false, // don't create session until something stored,
  resave: false // don't save session if unmodified
}));

// Add OAuth server.
app.oauth = new oauthServer({
  model: model,
  grants: ['authorization_code'],
  debug: true
});

app.post('/user', user.addUser);

app.get('/oauth/login', auth.form);
app.post('/oauth/login', auth.login);

app.get('/oauth/authorize', auth.auth);
app.post('/oauth/authorize', auth.decision, app.oauth.authorize({
  authenticateHandler: {
    handle: auth.loadCurrentUser
  }
}));

app.post('/oauth/token', app.oauth.token());

app.get('/email', app.oauth.authenticate(), email.email);

// Start listening for requests.
app.listen(3000);