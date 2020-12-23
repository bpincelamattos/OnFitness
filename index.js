require('dotenv').config();
const express = require('express');
const dbFile = require('./db');
const bcrypt = require('bcrypt');
var passport = require('passport');
var session = require('express-session');
const flash = require('connect-flash');
//var flash = require('express-flash');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 3000;

app.use(cookieParser('secret'));
app.use(flash());
app.use(session({
        secret: 'abcdefg',
        resave: false,
        saveUninitialized: false,
        cookie: {maxAge:60000}
    })
);

require('./controllers/auth');

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static("public"));

// set the view engine to ejs
app.set('view engine','ejs');


app.use(express.json());
app.use(express.urlencoded({extended: false}));


//Importing our Routes
const onFitnessRoutes = require('./routes/onfitness');
const authRoutes = require('./routes/auth');

// Routes - Orders
app.use('/onfitness', onFitnessRoutes);
app.use('/auth', authRoutes);

app.get('*', (req, res) => {
    res.status(404).send('Nao Achei');
})

app.listen(PORT, () => {
    console.log(`Server started on PORT:${PORT}`);
})
