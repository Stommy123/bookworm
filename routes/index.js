const express = require('express');
const router = express.Router();
const User = require('../models/user');
const mid = require('../middleware');

router.get('/profile', mid.requiresLogin, function(req, res, next) {
  User.findById(req.session.userId)
  .exec(function(error, user) {
    if (error) {
      return next(error)
    } else {
      return res.render('profile', { title: 'Profile', name: user.name, favorite: user.favoriteBook })
    }
  })
})

router.get('/logout', function(req, res, next) {
  if (req.session) {
    req.session.destroy(function(err) {
      if (err) {
        return next(err)
      } else {
        return res.redirect('/')
      }
    })
  }
})

router.get('/login', mid.loggedOut, function(req, res, next) {
  return res.render('login', { title: 'Log In' });
});

router.post('/login', function(req, res, next) {
  if (req.body.email && req.body.password) {
    User.authenticate(req.body.email, req.body.password, function(error, user) {
      if (error || !user) {
        const err = new Error('Wrong email or password');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });
  } else {
    const err = new Error('Email and Password are both required');
    err.status = 401;
    return next(err);
  }
});

router.get('/register', mid.loggedOut, function(req, res, next) {
  return res.render('register', { title: 'Sign Up' });
});

router.post('/register', function(req, res, next) {
  if (req.body.email &&
      req.body.name &&
      req.body.favoriteBook &&
      req.body.password &&
      req.body.confirmPassword) {
        if (req.body.password !== req.body.confirmPassword) {
          let err = new Error('Password does not match');
          err.status = 400;
          return next(err)
        }

        const userData = {
          email: req.body.email,
          name: req.body.name,
          favoriteBook: req.body.favoriteBook,
          password: req.body.password 
        };

        User.create(userData, function(error, user) {
          if (error) {
            return next(error);
          } else {
            return res.redirect('/profile');
          }
        });
      } else {
        let err = new Error('All fields required.');
        err.status = 400;
        return next(err)
      }
});

// GET /
router.get('/', function(req, res, next) {
  return res.render('index', { title: 'Home' });
});

// GET /about
router.get('/about', function(req, res, next) {
  return res.render('about', { title: 'About' });
});

// GET /contact
router.get('/contact', function(req, res, next) {
  return res.render('contact', { title: 'Contact' });
});

module.exports = router;
