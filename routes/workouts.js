const express = require('express');
const router = express.Router();

const controller = require('../controllers/workouts');

router.get('/', controller.findAll) //Get All workout post

router.post('/', controller.create) //Post a workout

//router.get('/list', controller.list)

//router.get('/create', ensureAuthenticated, controller.new)

router.delete('/:id', controller.delete) //Delete a post by ID

router.get('/:id', controller.findOneId); //Get a post by ID 

router.get('/exerciseType/:exercise_type', controller.findOneType); //Get a post by exercise type

router.patch('/:id', controller.update); //Update workout by ID

module.exports = router;