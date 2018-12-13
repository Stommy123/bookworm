const express = require('express');
const router = express.Router();
const User = require('../models/user');
const mid = require('../middleware');

router.get('/logout', (req, res, next) => req.session && req.session.destroy(err =>  err ? next() : res.redirect('/')))
router.get('/login', mid.loggedOut, (req, res, next) => res.render('login', { title: 'Log In' }))
router.get('/', (req, res, next) => res.render('index', { title: 'Home' }));
router.get('/about', (req, res, next) => res.render('about', { title: 'About' }));
router.get('/contact', (req, res, next) => res.render('contact', { title: 'Contact' }));
router.get('/register', mid.loggedOut, (req, res, next) => res.render('register', { title: 'Sign Up' }))
router.get('/profile', mid.requiresLogin, (req, res, next) => {
  User.findById(req.session.userId)
  .exec((err, user) => err ? next(err) : res.render('profile', { title: 'Profile', name: user.name, favorite: user.favoriteBook }))
})

router.post('/login', (req, res, next) => {
  if (req.body.email && req.body.password) {
    User.authenticate(req.body.email, req.body.password, (error, user) => {
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

router.post('/register', (req, res, next) => {
  if (req.body.email &&
      req.body.name &&
      req.body.favoriteBook &&
      req.body.password &&
      req.body.confirmPassword) {
        if (req.body.password !== req.body.confirmPassword) {
          const err = new Error('Password does not match');
          err.status = 400;
          return next(err)
        }
        const userData = {
          email: req.body.email,
          name: req.body.name,
          favoriteBook: req.body.favoriteBook,
          password: req.body.password 
        };
        User.create(userData, (error, user) => error ? next(error) : res.redirect('/profile'))
      } else {
        const err = new Error('All fields required.');
        err.status = 400;
        return next(err)
      }
});

module.exports = router;
