require('dotenv').config();
const express = require('express');
const dbFile = require('./models/db');
const bcrypt = require('bcrypt');
var passport = require('passport');
var session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;

 const pgSession = require('connect-pg-simple')(session);
 const pgStoreConfig = {conString: `postgres://postgres:${process.env.PGP_PASSWORD}@localhost:5432/on_fitnessdb`}

app.use(cookieParser('secret'));
app.use(flash());
app.use(session({
        store: new pgSession(pgStoreConfig),
        secret: `${process.env.SESSION_SECRET}`,
        name: "OnFitness",
        resave: false,
        saveUninitialized: false,
        cookie: {maxAge:7200000, sameSite: false}
    })
);

require('./controllers/auth');

app.use(passport.initialize());
app.use(passport.session());

app.use("/public",express.static(__dirname + "/public"));

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

io.sockets.on('connection', socket => { console.log("socket server connected.") });
http.listen(PORT, () => console.log(`Server started on PORT:${PORT}`));

exports.io = io;
