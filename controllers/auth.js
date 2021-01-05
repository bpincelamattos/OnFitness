const passport = require('passport');
const dbFile = require('../models/db');
const FacebookStrategy = require('passport-facebook').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const io = require('.././index')

exports.createUser = (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  dbFile.db.oneOrNone("SELECT * from users WHERE email = $1", [email])
      .then((user) =>{
        if (user == null ){
          bcrypt.hash(password, saltRounds, function(err, hash) {
            dbFile.db.none("INSERT INTO users (name, email, password) VALUES ($1, $2, $3)", 
            [name, email, hash]).then( () => {
              dbFile.db.one("SELECT * from users WHERE email = $1", [email])
              .then((user) =>{
                res.redirect(`/onfitness/user/${user.id}`);
              }) 
            });
            });
        } else {
          var err = {message: "Email already exists"};
          io.io.sockets.emit('error', err);
        }
        
      }) 
 
}

//Passport configuration - Facebook Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: process.env.FB, 
    profileFields: [ "displayName","email", "photos"]
  },
  function(accessToken, refreshToken, profile, cb) {
    const provider_id = parseInt(profile.id);
    const user_name = profile._json.name
    dbFile.db.oneOrNone('SELECT * FROM users where provider_id = $1', [provider_id])
      .then((user,err) => {
        if (err){
          console.log('ERRO')
          return cb(err)
        }
        if(user == null){
          dbFile.db.none("INSERT INTO users (name, provider_id) VALUES ($1, $2)", [user_name, provider_id]).then(() => {
            dbFile.db.one('SELECT * FROM users where provider_id = $1', [provider_id]).then((user) => {
              return cb(null, user)
            })
          });
        }
        if(user != null){
          dbFile.db.one('SELECT * FROM users where provider_id = $1', [provider_id]).then((user) => {
            return cb(null, user)
          })
        }
      
    })
  }
))
  

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
  cb(null, user);
});
passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});
