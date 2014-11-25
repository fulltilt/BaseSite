var express  = require('express');
var mongoose = require('mongoose');
var session  = require('express-session');
var flash    = require('connect-flash');
var path     = require('path');
var passport = require('passport');
var flash    = require('connect-flash');
var app      = express();

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');


var configDB = require('./config/database.js');
mongoose.connect(configDB.url);

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev'));     // log every request to the console
app.use(cookieParser());    // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

// required for passport
require('./config/passport')(passport); // pass passport for configuration
app.use(session({ secret: 'MEAN' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

var hbs = require('hbs');
//app.set('view engine', 'html');
app.engine('html', hbs.__express);
app.use(bodyParser());

app.use(express.static(path.join(__dirname, 'public')));

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});