const multer = require('multer');
const AWS = require('aws-sdk');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const bcrypt = require('bcryptjs')
const User = require('../models/userModel')
const config = require('../utils/config')

const createError = require('../utils/error')

// configure AWS SDK with your access credentials and S3 bucket name
const s3 = new AWS.S3({
    accessKeyId: `${config.AWS_ACCESS_KEY_ID}`,
    secretAccessKey: `${config.AWS_SECRET_ACCESS_KEY}`,
    region: `${config.AWS_LOCATIONCONSTRAINT}`
});
const bucketName = `${config.AWS_BUCKETNAME}`
  
// configure multer middleware to limit file size to 3 MB and accept only png and jpg files
const upload = multer({
    limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB
    fileFilter: function (req, file, cb) {
        const extname = path.extname(file.originalname).toLowerCase();
        if (extname !== '.png' && extname !== '.jpg') {
        return cb(new Error('Only png and jpg files are allowed'));
        }
        cb(null, true);
    }
});

const updateUserProfileDp = async (req, res, next) => {
    // #swagger.tags = ['Users']
    // #swagger.description = "Endpoint to update User's Profile DP."
  
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return next(createError(401, "User not found!"));
      }
  
      // call multer middleware with 'profile_dp' field name to handle file upload
      upload.single('profile_dp')(req, res, async function(err) {
        if (err) {
          // handle error (e.g. file size exceeded limit, or file type not allowed)
          return next(createError(400, err.message));
        }
  
        // file uploaded successfully, so upload to S3 bucket
        const file = req.file;
        // const fileKey = uuidv4(); // generate unique key for S3 object
        const fileKey = user._id.toString();
        const extname = path.extname(file.originalname).toLowerCase();
        const contentType = `image/${extname.substring(1)}`;
        const params = {
          Bucket: bucketName,
          Key: fileKey,
          Body: file.buffer,
          ContentType: contentType
        };
        s3.upload(params, async function(err, data) {
          if (err) {
            // handle error (e.g. failed to upload to S3)
            return next(createError(500, err.message));
          }
  
          // file uploaded to S3 successfully, so update user's image field in the database
          const imageUrl = data.Location;
          try {
                // delete the previously uploaded image if it exists
                if (user.image) {
                    const deleteParams = {
                        Bucket: bucketName,
                        Key: user.image.split('/').pop(),
                    };
                    s3.deleteObject(deleteParams, function(deleteErr, deleteData) {
                        if (deleteErr) {
                        console.log(deleteErr);
                        }
                    });
                }

                const updatedUser = await User.findByIdAndUpdate(
                req.params.id,
                { image: imageUrl },
                { new: true }
                );
                
                res.status(200).json({ updatedUser, message: `User's details updated` });
            } catch (err) {
                // delete the uploaded file if failed to update user's image
                const deleteParams = {
                Bucket: bucketName,
                Key: fileKey,
                };
                s3.deleteObject(deleteParams, function(deleteErr, deleteData) {
                if (deleteErr) {
                    console.log(deleteErr);
                }
                });
                return next(createError(500, err.message));
          }
        });
      });
    } catch (err) {
      next(err);
    }
  };  

const updateUser = async (req, res, next)=>{
    // #swagger.tags = ['Users']
    // #swagger.description = 'Endpoint to update User's details.'

    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, 
            {$set: req.body},
            {new: true}
            )
        if(!updatedUser) return next(createError(401, "User Not Found'!"))
            res.status(200).json({updatedUser:updatedUser, message:`User's details updated`})
    } catch (err) {
        next(err)
    }
}
 const updateUserPassword = async (req, res, next)=>{
    // #swagger.tags = ['Users']
    // #swagger.description = 'Endpoint to update User's password.'
    try {
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(req.body.npassword, salt)
    
        const user = await User.findById(req.params.id)
        if(!user){ 
            return next(createError(401, "User Not Found'!"))
        }else{
            const  isPasswordCorrect = await bcrypt.compare(req.body.opassword, user.password)
            if(!isPasswordCorrect){
                return next(createError(400, "Old Password is wrong"))
            }else{
             user.password =  hash || user.password 
            const updatedUser = await user.save()
            res.status(200).json({updatedUser: updatedUser, message:`Password updated`})
            }
        }
    } catch (err) {
        next(err)
    }
}

 const deleteUser = async (req, res, next)=>{
    // #swagger.tags = ['Users']
    // #swagger.description = 'Endpoint to Delete User.'
    try {
       const user =  await User.findByIdAndDelete(req.params.id)
       if(!user) return next(createError(401, "User Not Found'!"))
        res.status(200).json({message:`User wth Id:${req.params.id} deleted`})
    } catch (err) {
        next(err)
    }
}

 const getUser = async (req, res, next)=>{
    // #swagger.tags = ['Users']
    // #swagger.description = 'Endpoint to Get a User.'
    try {
        const user = await User.findById( req.params.id)
         if(!user) return next(createError(401, "User Not Found'!"))
            res.status(200).json({user:user}) 
    } catch (err) {
        next(err)
    }
}

 const getUsers = async (req, res, next)=>{
    // #swagger.tags = ['Users']
    // #swagger.description = 'Endpoint to Get all Users.'
    try {
        const users = await User.find()
        if(!users) return next(createError(401, "Users Not Found'!"))
            res.status(200).json({users:users})
    } catch (err) {
        next(err)
    }
}



module.exports ={
    updateUserProfileDp,  updateUser, updateUserPassword, deleteUser, getUser, getUsers
}