var express = require('express');
var expressSession = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var basicAuth = require('basic-auth');
var debug = require('debug')('NodeServ');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var mongoose = require('mongoose');
var User = require('./models/user');
var bcrypt = require('bcrypt');
mongoose.connect('mongodb://localhost/prototype');



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressSession({
    secret: 'superSecretKey'
}));
app.use(passport.initialize());
app.use(passport.session());
var routes = require('./routes/index')(passport);
var users = require('./routes/users');

app.use('/', routes);
app.use('/users', users);


passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});
var isValidPassword = function (user, password) {
    console.log(user + " " + password);
    if (user.password && password) {
        return bcrypt.compareSync(password, user.password);
    }
}
passport.use(new LocalStrategy(
    function (username, password, done) {
        // check in mongo if a user with username exists or not
        User.findOne({
                'username': username
            },
            function (err, user) {
                // In case of any error, return using the done method
                if (err)
                    return done(err);
                // Username does not exist, log error & redirect back
                if (!user) {
                    console.log('User Not Found with username ' + username);
                    return done(null, false);
                }
                // User exists but wrong password, log the error
                if (!isValidPassword(user, password)) {
                    console.log('Invalid Password');
                    return done(null, false);
                }
                // User and password both match, return user from
                // done method which will be treated like success

                return done(null, user);
            }
        );
    }));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address().port);
});

module.exports = app;