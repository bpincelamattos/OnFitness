const express = require('express');
const router = express.Router();

const controller = require('../controllers/onfitness');

// Ensure authenticated
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}


router.get('/workouts', controller.findAll) //Get All workout post

router.post('/workouts', controller.create) //Post a workout

//router.get('/list', controller.list)

router.get('/create', ensureAuthenticated, controller.new)

router.delete('/workouts/:id', controller.delete) //Delete a post by ID

router.get('/workouts/:id', controller.findOneId); //Get a post by ID 

router.get('/workouts/exerciseType/:exercise_type', controller.findOneType); //Get a post by exercise type

router.patch('/workouts/:id', controller.update); //Update workout by ID

module.exports = router;