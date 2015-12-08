//Set up tool
var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var path = require('path');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var ejs = require('ejs');

var configDB = require('./config/database.js');

//Connect to DB
mongoose.connect(configDB.url, function(err) {
  if (err) {
    console.log('Connection failed!');
  }
  console.log('Connection sucessfully.');
});

//Setup expressaplication
app.use(express.static(path.join(__dirname, 'bower_components')));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.set('view-engine', ejs);

//Required for passport
app.use(session({secret: 'thisissessionscret'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//Load our routes and pass it to pasport
require('./app/routes.js')(app, passport);
require('./config/passport')(passport);

//Launch
app.listen(port);
console.log('Server running at http://localhost:'+port);
