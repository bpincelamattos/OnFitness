const passport = require('passport');
const dbFile = require('../db');
const FacebookStrategy = require('passport-facebook').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const express = require('express');
const app = express();

const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.createUser = (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  bcrypt.hash(password, saltRounds, function(err, hash) {
    dbFile.db.none("INSERT INTO users (name, email, password) VALUES ($1, $2, $3)", 
                [name, email, hash]).then( () => {
        res.render('create');
    });
    // Store hash in your password DB.
  });
}

//Passport configuration - Facebook Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: process.env.FACEBOOK_CALL_BACK_URL
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
      return cb(null,profile);
  }));

//Passport configuration - localstrategy Strategy
passport.use(new LocalStrategy({
  passReqToCallback : true,
  usernameField: 'email',
  passwordField: 'password',
},
  function(req, email, password, cb) {
    dbFile.db.oneOrNone('SELECT * FROM users where email = $1', [email])
      .then((user,err) => {
        if (err){
          return cb(err)
        }
        if(!user){
          return cb(null,false, req.flash('error', 'User not Found'))
        } 
    
        if(user != null)
        {    
          bcrypt.compare(password, user.password, function(err, res){
            if(res){
              return cb(null, user)
            } else {
              return cb(null, false, req.flash('error', "Password Incorrect") );
            }
          })  
        }
      });
  }))
  
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, cb) {
  console.log('Serialize user called');
  cb(null, user);
});
passport.deserializeUser(function(obj, cb) {
  console.log('Deserialize user called');
  cb(null, obj);
});
