const express = require('express');
const router = express.Router();
const passport = require('passport');
const controller = require('../controllers/auth');
const app = express();




//Facebook Login
router.get('/facebook', passport.authenticate('facebook'));

//Facebook callback URL
router.get('/facebook/callback', 
    passport.authenticate('facebook', 
    { successRedirect: '/onfitness/create', failureRedirect: '/login' }
));

//Local-Strategy - Log in
router.get('/login', (req, res, next) => {
  const errors = req.flash().error || [];
  console.log(errors)
  res.render('login', {errors});
});
router.post('/login', passport.authenticate('local',{ 
  failureFlash: true, 
  failureRedirect: '/auth/login',  
}), (req, res, next) => {
    res.redirect('/onfitness/create');
  });


//Local-Strategy - Sign up a new user
router.get('/signup', (req, res, next) => {
    res.render('signup');
});
router.post('/signup', controller.createUser)

//Logout
router.get('/logout', function(req, res, next) {
    console.log('logging out');
    req.logout();
    res.redirect('/');
})

module.exports = router;