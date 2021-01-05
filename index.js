require('dotenv').config();
const express = require('express');
const dbFile = require('./models/db');
const bcrypt = require('bcrypt');
var passport = require('passport');
var session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;
const DBCONNECTIONSTRING = process.env.DATABASE_URL || `postgres://postgres:${process.env.PGP_PASSWORD}@localhost:5432/on_fitnessdb`;

 const pgSession = require('connect-pg-simple')(session);
 const pgStoreConfig = {conString: DBCONNECTIONSTRING};
 process.env.PWD = process.cwd();

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

//app.use("/public",express.static(process.env.PWD || __dirname + "public"));
//app.use(express.static(path.normalize(path.join(process.env.PWD, '/public'))));
app.use('/public', express.static(process.env.PWD + '/public'));
console.log(process.env.PWD + '/public');
console.log(__dirname + '/public');
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
