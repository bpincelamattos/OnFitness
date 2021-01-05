const dbFile = require('../models/db')
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const { extname } = require('path');
const io = require('.././index')


//Set Storage Engine WorkoutPost Media
const storage = multer.diskStorage({
  destination: './public/uploads/workoutPostPictures',
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
});

//Set Storage Engine Profile Picture
const profileStorage = multer.diskStorage({
  destination: './public/uploads/profilePictures',
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
});

//Workoutpost picture upload
const upload = multer({
  storage: storage,
  limits:{fileSize: 1000000}, //Seting a size limit of 1MegaByte
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single("media");

//Profile Picture Upload
const uploadProfilePicture = multer({
  storage: profileStorage,
  limits:{fileSize: 1000000}, //Seting a size limit of 1MegaByte
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single("pic_profile");

//Check File Type
function checkFileType(file, cb){
  //Allowed ext
  const fileTypes = /jpeg|jpg|png|gif/;
  //check ext
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
 
  if(extName){
    return cb(null, true);
  }else {   
    console.log('error');
    cb('Error: Images Only!');
  }
}

//Get user page
exports.findUser = (req, res) => {
  const userId = req.params.id;
  const sessionId = req.session.passport.user.id;
  dbFile.db.one("SELECT * from users WHERE id = $1", [userId]).then((user) =>
  {
    if(!user.pic_path){user.pic_path = "public/assets/avatar_profile.jpg"; }
    if(!user.about_me){user.about_me = "Tell us About Yourself";}
    let hide = sessionId == userId;
    dbFile.db.manyOrNone("SELECT * FROM WORKOUTPOST WHERE user_id = $1", [userId]).then((workoutPost) => 
    {      
      dbFile.db.one("SELECT COUNT (*) FROM WORKOUTPOST WHERE user_id = $1", [userId]).then((workoutNumber) => {
        let postCount = workoutNumber.count;
        dbFile.db.one("SELECT COUNT (*) FROM likes WHERE user_id = $1", [userId]).then((likeNumber) => {
          let likeCount = likeNumber.count;
          res.render('user', {user, workoutPost, postCount, hide, sessionId, likeCount});
        }).catch((error) => {
          console.log("user page error occurred. LIKE NUMBER " + error)
        })
      }).catch((error) => {
        console.log("user page error occurred. WORKOUT NUMBER " + error)
      })
    }).catch((error) => {
      console.log("user page error occurred. WORKOUT POST " + error)
    })
  }).catch((error) => {
    console.log("user page error occurred. USER " + error)
  })
}

//create a workoutPost
exports.create = (req, res) => {
  upload(req, res, (err) => {
    //Error check
    if (err) {
    
     io.io.sockets.emit('error', err)
    } 
    else 
    {
      const exerciseType = req.body.exercise_type;
      const exerciseDescription =  req.body.exercise_description;
      const userId = req.body.user_id;
      const path = req.file.path;
      dbFile.db.none("INSERT INTO workoutPost (path, exercise_type, exercise_description, user_id) VALUES ($1, $2, $3, $4)", 
      [path, exerciseType, exerciseDescription, userId]).then( (err) => {
        if (err)
        {
          res.send('ops')
        } 
        else 
        {
          dbFile.db.one("SELECT * from users WHERE id = $1", [userId])
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
  const userId = req.query.user_id;
  dbFile.db.manyOrNone("SELECT * from workoutPost WHERE exercise_type ilike $1", 
    [exerciseType]).then((workoutPost) => {
        dbFile.db.one("SELECT * from users WHERE id = $1", [userId])
            .then((user) =>
            {
              dbFile.db.one("SELECT COUNT (*) FROM WORKOUTPOST WHERE user_id = $1", [userId]).then((workoutNumber) => {
                let postCount = workoutNumber.count;
                res.render('user', {user, workoutPost, postCount});
              })
            })
    });
}

//Patch Existing WorkoutPost
exports.update = (req, res) => {
    const exerciseType = req.body.type;
    const exerciseDescription = req.body.description;
    const id = req.body.url_id;
    dbFile.db.none("UPDATE workoutPost SET exercise_type = $1, exercise_description = $2 WHERE id = $3", [
      exerciseType,
      exerciseDescription,
      id
    ]).then(() => {
      res.status(200)
    }); 
}

//Insert Likes in a WorkoutPost
exports.likePost = (req, res) => {  
  const workoutPostId = req.body.workoutPostId;
  const userId = req.session.passport.user.id;
  console.log(workoutPostId)
  console.log(userId)
  dbFile.db.oneOrNone("SELECT * FROM LIKES WHERE user_id = $1", [userId]).then((likes) => {
    if(likes == null){
      dbFile.db.none("INSERT INTO likes (user_id, post_id) VALUES ($1, $2)", [userId, workoutPostId]).then(() => {
        res.status(200);
      }).catch((err) => {
        console.log("Catch Error. Insert Like Query")
    })} 
     else {
      var err = {message: "This post has already been liked by you."};
      io.io.sockets.emit('error', err);
    } 
  }) 
  
}

//Insert a About and Profile Picute
exports.createAbout = (req, res) => {
  uploadProfilePicture(req, res, (err) => {
    if (err) {
      console.log(err)
    } 
    else 
    {
      const about =req.body.about_me;
      const userId = req.body.user_id;
      const path = req.file.path;
      dbFile.db.none("UPDATE users SET pic_path = $1, about_me = $2 WHERE id = $3", 
      [path, about,userId]).then( (err) => {
        if (err)
        {
          res.send('ops')
        } 
        else 
        {
          dbFile.db.one("SELECT * from users WHERE id = $1", [userId])
          .then((user) =>
          {
            res.redirect(`/onfitness/user/${user.id}`);
          })
        }
    });
    }
  })
}

//Find a User
exports.searchUser = (req, res) => {
  dbFile.db.manyOrNone("SELECT * FROM USERS").then((users) => {
    res.render('search', {users});
  })

}

//Get Likes from the WorkoutPost
exports.findLikes = (req, res) => {
  const userId = req.session.passport.user.id;
  dbFile.db.manyOrNone("SELECT * from likes WHERE user_id = $1", [userId]).then((likes) =>{
    for (let i=0; i<likes.length; i++){ 
      const like = likes[i];
      dbFile.db.manyOrNone("SELECT * FROM workoutpost where id = $1", [like.post_id]).then((workoutPosts) => {
          res.render('likes', {workoutPosts});
      })
    }
  })
}