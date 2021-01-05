const express = require('express');
const router = express.Router();

const controller = require('../controllers/onfitness');

// Ensure authenticated
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/login');
}

router.get('/user/:id', ensureAuthenticated, controller.findUser) //Get User Page by Id

router.get('/users/searchAll',ensureAuthenticated, controller.findAllUsers) //Get All Users

router.get('/users/searchOne', ensureAuthenticated, controller.findOneUser) //Get One User (by name)

router.get('/workouts/likes/:id',ensureAuthenticated, controller.findLikes); //Get all the likes of a user by User_id

router.post('/workouts/user/about',ensureAuthenticated, controller.createAbout); //Create About me

router.post('/workouts', ensureAuthenticated, controller.create) //Post a workout

router.post('/workouts/like',ensureAuthenticated, controller.likePost); //Post a like 

router.patch('/workouts/:id', ensureAuthenticated, controller.update); //Update workout by ID

router.delete('/workouts/:id', ensureAuthenticated, controller.delete) //Delete a post by ID

router.get('/workouts/exerciseType/', ensureAuthenticated, controller.findOneType); //Get a post by exercise type

module.exports = router;