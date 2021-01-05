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

router.get('/user/:id', ensureAuthenticated, controller.findUser) //Get User Page

router.get('/users/search', controller.searchUser)

router.get('/workouts/likes', controller.findLikes);

router.post('/workouts/user/about', controller.createAbout); //Create About me

router.post('/workouts', ensureAuthenticated, controller.create) //Post a workout

router.post('/workouts/like', controller.likePost);

router.patch('/workouts/:id', ensureAuthenticated, controller.update); //Update workout by ID

router.delete('/workouts/:id', ensureAuthenticated, controller.delete) //Delete a post by ID

router.get('/workouts/exerciseType/', ensureAuthenticated, controller.findOneType); //Get a post by exercise type

module.exports = router;