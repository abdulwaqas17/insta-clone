var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// ye server pr user ka data store krwata h, ta k user ko bar bar login na krna paray. 
var expressSession = require('express-session');

var indexRouter = require('./routes/index'); // import routes
var usersRouter = require('./routes/users'); // import collection
const passport = require('passport');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//server memory m temporray tor per user ka data persist rakhy ga, ye data store krna ka allow kr rha h
app.use(expressSession({
  resave: false,
  saveUninitialized: false,
  secret: "heyheyehhdd"
}));


// intialize the passport, jo login,register aur protected routes bnaye ga, ya sari functionality mange krta h
app.use(passport.initialize());
app.use(passport.session()); // is k wajah se data store ho rha h

passport.serializeUser(usersRouter.serializeUser());
passport.deserializeUser(usersRouter.deserializeUser());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler 
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;


// 9 - 10 ==> 4
// 10 - 11 ==> 8
// 11 - 12 ==> 8
// 12 - 1 ==> 5