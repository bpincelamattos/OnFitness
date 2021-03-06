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
      const userId = req.body.user_id_wp;
      const path = req.file.path;
      console.log(req.body)
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
  const sessionId = req.session.passport.user.id;
  const exerciseType = req.query.search_type;
  const userId = req.query.user_id_sc;
  console.log(req.query)
  dbFile.db.manyOrNone("SELECT * from workoutPost WHERE exercise_type ilike $1", 
    [exerciseType]).then((workoutPost) => {
        dbFile.db.one("SELECT * from users WHERE id = $1", [userId])
            .then((user) =>
            {
              if(!user.pic_path){user.pic_path = "public/assets/avatar_profile.jpg"; }
              if(!user.about_me){user.about_me = "Tell us About Yourself";}
              let hide = sessionId == userId;
              
                dbFile.db.one("SELECT COUNT (*) FROM WORKOUTPOST WHERE user_id = $1", [userId]).then((workoutNumber) => {
                  let postCount = workoutNumber.count;
                  dbFile.db.one("SELECT COUNT (*) FROM likes WHERE user_id = $1", [userId]).then((likeNumber) => {
                    let likeCount = likeNumber.count;
                    res.render('user', {user, workoutPost, postCount, hide, sessionId, likeCount});
                  }).catch((error) => {
                    console.log("user page error occurred. LIKE NUMBER " + error)
                  })
              })
            }).catch((error) => {
              console.log("user page error occurred. USER " + error)
          })
    }).catch((error) => {
      console.log("user page error occurred. WORKPOST " + error)
  })
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
  const workoutPostId = req.body.workoutPostId; //post liked
  const userSessionId = req.session.passport.user.id; // user that liked the post
  dbFile.db.oneOrNone("SELECT * FROM LIKES WHERE user_id = $1 AND post_id= $2", [userSessionId,workoutPostId ]).then((like) => {

    if(like === null){
      dbFile.db.none("INSERT INTO likes (user_id, post_id) VALUES ($1, $2)", [userSessionId, workoutPostId]).then(() => {
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
      const userId = req.body.user_id_pf;
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

//Get All User
exports.findAllUsers = (req, res) => {
  const sessionId = req.session.passport.user.id;
  dbFile.db.manyOrNone("SELECT * FROM USERS").then((users) => {
    res.render('search', {users, sessionId});
  })
}

//Get One user
exports.findOneUser = (req, res) => {
  const sessionId = req.session.passport.user.id;
  let searchUser = req.query.search_user || null ;
  console.log(searchUser);
  dbFile.db.manyOrNone('SELECT * FROM users WHERE name ilike $1', [`%${searchUser}%`]).then((users) => {
      res.render('search', {users, sessionId});
  })
}

//Get Likes from the WorkoutPost
exports.findLikes = (req, res) => {
  const sessionId = req.session.passport.user.id;
  const userId = req.params.id; //user page clicked id
  var workoutPostResponse = [];
  dbFile.db.manyOrNone("SELECT likes.user_id, workoutpost.id, workoutpost.path, workoutpost.exercise_type, workoutpost.exercise_description, workoutpost.created_at, workoutpost.user_id FROM likes INNER JOIN workoutpost ON workoutpost.id = likes.post_id WHERE likes.user_id = $1", [userId]).then((likes) =>{
    workoutPostResponse.push(likes);
    console.log(workoutPostResponse[0]);
    workoutPostResponse = workoutPostResponse[0];
    res.render('likes', {workoutPostResponse, sessionId});
    });
  };
  