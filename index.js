require('dotenv').config();
const express = require('express');
const app = express();
const PORT = 3000;
const mustacheExpress = require('mustache-express');

//Register '.mustache' extension with The mustache Express
app.engine('html', mustacheExpress());
app.set('views', './views')
app.set('view engine', 'html')


app.use(express.json());
app.use(express.urlencoded({extended: false}));

//Importing our Routes
const workoutRoutes = require('./routes/workouts');

// Routes - Orders
app.use('/workouts', workoutRoutes);

app.get('*', (req, res) => {
    res.status(404).send('Nao Achei');
})

app.listen(PORT, () => {
    console.log(`Server started on PORT:${PORT}`);
})

