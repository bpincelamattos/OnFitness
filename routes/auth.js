const express = require('express');
const router = express.Router();
const passport = require('passport');
const controller = require('../controllers/auth');
const dbFile = require('../models/db');
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
  res.render('login', {errors});
});
router.post('/login', passport.authenticate('local',{ 
  failureFlash: true, 
  failureRedirect: '/auth/login',  
}), (req, res, next) => {
  const email = req.body.email;
  dbFile.db.one("SELECT * from users WHERE email = $1", [email])
    .then((user) =>{
      res.redirect(`/onfitness/user/${user.id}`);
    })
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