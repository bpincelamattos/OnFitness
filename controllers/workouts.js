const pgp = require("pg-promise")();
const db = pgp(`postgres://postgres:${process.env.PGP_PASSWORD}@localhost:5432/on_fitnessdb`);

//read all workouts
exports.findAll = (req, res) => {
    //db.any("SELECT * from workoutPost").then((workoutPost) => res.send(workoutPost));
    res.render('home', {name: 'Barbs'});
}

//create a workoutPost
exports.create = (req, res) => {
    const media = req.body.media;
    const exerciseType = req.body.exercise_type;
    const exerciseDescription =  req.body.exercise_description;
    db.none("INSERT INTO workoutPost (media, exercise_type, exercise_description) VALUES ($1, $2, $3)", 
                [media, exerciseType, exerciseDescription]).then( () => {
        res.send(`Workout "${exerciseType}" was posted`);
    });
}

//Deleting a workoutPost
exports.delete = (req, res) => {
    const workoutId = req.params.id;
    db.none("DELETE FROM workoutPost WHERE id = $1", [workoutId]).then(() =>
    res.send(`Workout was deleted`)
  );
}

exports.findOneId = (req, res) => {
    const workoutId = req.params.id;
    db.any("SELECT * from workoutPost WHERE id =$1", [workoutId]).then((workoutPost) => res.send(workoutPost));
}

exports.findOneType = (req, res) => {
    const exerciseType = req.params.exercise_type;
    db.any("SELECT * from workoutPost WHERE exercise_type = $1", [exerciseType]).then((workoutPost) => res.send(workoutPost));
}

exports.update = (req, res) => {
    const workoutId = req.params.id;
    const media = req.body.media;
    const exerciseType = req.body.exercise_type;
    const exerciseDescription = req.body.exercise_description;
    db.none("UPDATE workoutPost SET media = $1, exercise_type = $2, exercise_description = $3 WHERE id = $4", [
      media,
      exerciseType,
      exerciseDescription,
      workoutId
    ]).then(() => {
      res.send(`Workout is updated"`);
    });
}