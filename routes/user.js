//Initialization
var router = require('express').Router();
var User = require('../models/user');
var passport = require('passport');
var passportConf = require('../config/passport');


//Establish route functionality for each page now, and then implement UI later

//Login 
router.get('/login', function(req, res) {
  if (req.user) return res.redirect('/');
  res.render('accounts/login', { message: req.flash('loginMessage')});
});

router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
}));


//Signup
router.get('/signup', function(req, res, next) {
  res.render('accounts/signup', {
    errors: req.flash('errors')
  });
});

router.post('/signup', function(req, res, next) {
  var user = new User();
  user.email = req.body.email;
  user.profile.name = req.body.name;
  user.password = req.body.password;
  user.profile.picture = user.gravatar();

  User.findOne({ email: req.body.email }, function(err, existingUser) {

    if (existingUser) {
      req.flash('errors', 'An email address already exists with that account');
      return res.redirect('/signup');
    } else {
      user.save(function(err, user) {
        if (err) return next(err);
        req.logIn(user, function(err) {
          if (err) return next(err);
          res.redirect('/profile');
        })
      });
    }
  });
});

//Logout
router.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
});

//Profile
router.get('/profile', function(req, res, next) {
  User.findOne({ _id: req.user._id }, function(err, user) {
    if (err) return next(err);
    res.render('accounts/profile', { user: user });

  });
});

router.get('/edit-profile', function(req, res, next) {
  res.render('accounts/edit-profile', { message: req.flash('success')});
});

router.post('/edit-profile', function(req, res, next) {
  User.findOne({ _id: req.user._id }, function(err, user) {

    if (err) return next(err);

    if (req.body.name) user.profile.name = req.body.name;
    if (req.body.address) user.address = req.body.address;

    user.save(function(err) {
      if (err) return next(err);
      req.flash('Success', 'Profile has been successively updated!');
      return res.redirect('/edit-profile');
    });
  });
});

module.exports = router;
