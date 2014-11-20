var express = require('express');
var router = express.Router();
var utils = require('../utils');
var cal = require('../models/calendar');
var User = require('../models/user');
/* GET home page. */


var isAuthenticated = function (req, res, next) {
    // if user is authenticated in the session, call the next() to call the next request handler 
    // Passport adds this method to request object. A middleware is allowed to add properties to
    // request and response objects
    if (req.isAuthenticated())
        return next();
    // if the user is not authenticated then redirect him to the login page
    res.redirect('/');
}


module.exports = function (passport) {
    router.get('/register', function (req, res) {
        res.render('register');
    });
    router.post('/register', function (req, res) {
        var pw = req.body.pass;
        var name = req.body.user;

        console.log(name + " " + pw);

        User.findOne({
            username: name
        }, function (err, user) {
            if (err) throw err;
            if (user) {
                res.send("schon vorhanden");
            } else {
                var newUser = new User({
                    username: name,
                    password: pw
                });
                newUser.save(function (err) {
                    if (err) throw err;
                });
                res.render('regSuccess', {
                    user: newUser.username
                });
            }
        });
    });
    router.get('/signout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    router.get('/login', function (req, res) {
        res.render('index');
    });


    router.post('/login', passport.authenticate('local', {
        successRedirect: '/home',
        failureRedirect: '/',
        failureFlash: true
    }));

    router.get('/home', isAuthenticated, function (req, res) {
        if (req.json) {
            res.send("json");
        }
        res.render('home', {
            user: req.user
        });
    });
    router.get('/', function (req, res) {
        res.render('start');
    });


    router.post('/api/login', passport.authenticate('local', {
        successRedirect: '/api/home',
        failureRedirect: '/api/error',
        failureFlash: false
    }));
    router.get('/api/error', function (req, res) {
        res.json({
            error: 'loginerror'
        });
    });

    router.get('/api/home', isAuthenticated, function (req, res) {
        res.json({
            username: req.user.username
        });
    });

    //route end in cal 
    //-------------------------------------------------
    router.post('/cal', utils.basicAuth('c', 'c'));
    router.get('/cal', utils.basicAuth('c', 'c'));
    router.route('/cal')

    .post(function (req, res) {
        var calendar = new cal();

        calendar.name = req.body.name;
        calendar.end = req.body.end;
        calendar.save(function (err) {
            if (err) res.send(err);
            res.json({
                message: 'Cal created'
            });
        });
    })

    .get(function (req, res) {
        cal.find(function (err, cals) {
            if (err) res.send(err);

            res.json(cals);
        });
    });

    //route that end in /cal/:cal_id
    //-----------------------------------------
    router.route('/cal/:cal_id')
        .get(function (req, res) {
            cal.findById(req.params.cal_id, function (err, calendar) {
                if (err) res.send(err);
                res.json(calendar)
            });
        })
        .put(function (req, res) {
            cal.findById(req.params.cal_id, function (err, calendar) {
                if (err) res.send(err);
                calendar.name = req.body.name;
                calendar.save(function (err) {
                    if (err) res.send(err);
                    res.json({
                        message: 'cal updated'
                    });
                });
            });
        })
        .delete(function (req, res) {
            cal.remove({
                _id: req.params.cal_id
            }, function (err, calendar) {
                if (err) res.send(err);

                res.json({
                    message: 'Sucessfully deleted'
                });
            });
        })

    router.get('*', function (req, res) {
        res.send("rofl", 404);
    });
    return router;
}