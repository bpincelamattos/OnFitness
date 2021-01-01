const dbFile = require('../models/db')
const fs = require('fs');
const multer = require('multer');
const path = require('path');

//Set Storage Engine
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
});

//Init upload
const upload = multer({
  storage:storage
}).single('media');

//Get user page
exports.findUser = (req, res) => {
  const userId = req.params.id;
  dbFile.db.one("SELECT * from users WHERE id = $1", [userId])
    .then((user) =>
    {
      dbFile.db.manyOrNone("SELECT * FROM WORKOUTPOST WHERE user_id = $1", [userId]).then((workoutPost) => {
        res.render('user', {user, workoutPost});
      })

    } )
}

//create a workoutPost
exports.create = (req, res) => {
  upload(req, res, (err) => {
    //Error check
    if (err) {
      console.log('oops')
    } 
    else 
    {
      const exerciseType = req.body.exercise_type;
      const exerciseDescription =  req.body.exercise_description;
      const user_id = req.body.user_id;
      const path = req.file.path;
      dbFile.db.none("INSERT INTO workoutPost (path, exercise_type, exercise_description, user_id) VALUES ($1, $2, $3, $4)", 
        [path, exerciseType, exerciseDescription, user_id]).then( (err) => {
          if (err)
          {
            res.send('ops')
          } 
          else 
          {
            dbFile.db.one("SELECT * from users WHERE id = $1", [user_id])
            .then((user) =>
            {
              res.redirect(`/onfitness/user/${user.id}`);
            })
          }
    });
    }
  })
}

//Deleting a workoutPost
exports.delete = (req, res) => {
    const workoutId = req.params.id;
    dbFile.db.none("DELETE FROM workoutPost WHERE id = $1", [workoutId]).then(() =>
    res.status(200)
  );
}

//Get WorkoutPost by Type
exports.findOneType = (req, res) => {

  const exerciseType = req.query.search_type;
  const user_id = req.query.user_id;
  dbFile.db.manyOrNone("SELECT * from workoutPost WHERE exercise_type ilike $1", 
    [exerciseType]).then((workoutPost) => {
        dbFile.db.one("SELECT * from users WHERE id = $1", [user_id])
            .then((user) =>
            {
              res.render('user', {user, workoutPost});
            })
    });
}

//Patch Existing WorkoutPost
exports.update = (req, res) => {
    const exerciseType = req.body.type;
    const exerciseDescription = req.body.description;
    const id = req.body.url_id;
    console.log(req.body);
    dbFile.db.none("UPDATE workoutPost SET exercise_type = $1, exercise_description = $2 WHERE id = $3", [
      exerciseType,
      exerciseDescription,
      id
    ]).then(() => {
      res.status(200)
    }); 
}