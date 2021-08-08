var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var dotenv = require('dotenv');
var authenticate =require('../middleware/authenticate');
dotenv.config({path:'./config.env'});

require('../db/conn');

const cloudinary = require('cloudinary').v2;
var User = require('../models/userSchema');

cloudinary.config({ 
  cloud_name:process.env.cloudname, 
  api_key: process.env.cloudinaryApiKey, 
  api_secret: process.env.cloudinarySecretKey,
  secure: true
});
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* for user registration. */
router.post('/register', async function(req, res, next) {
  const {imagePath,name,email,password,cpassword}=req.body;

if(!name || !email || !password || !cpassword ){
return res.status(422).json({message:"Plz filled the data  Properly"});
}

try{
  const userExist =  await User.findOne({email:email});

  if(userExist){
       return res.status(422).json({error:"Email Already Exist"});
     }
     else if(password != cpassword){
      return res.status(422).json({error:"Password Not Match"});
     }
     else{
      const user = new User({imagePath,name,email,password,cpassword});
      await user.save();
      res.status(201).json({data : user, message:"Successfully Registered"});
 

     }
   
}
catch(err){
  console.log(err);
}



});

/* for user Login */
router.post('/login', async function(req, res, next) {
  const {email,password}=req.body;
  
  if(!email || !password){
  return res.status(422).json({message:"Plz filled the data  Properly"});
  }
    
  
  try{
    const userLogin =  await User.findOne({email:email});
  
    if(userLogin){

    const isMatch= await bcrypt.compare(password,userLogin.password);
    const token= await userLogin.generateAuthToken();
   console.log("token ", token);

   

    if(!isMatch){
      return res.status(400).json({error:"Invalid Credentials"});
    }
    else{
      res.cookie("jwtoken",token,{
        expires:new Date(Date.now()+ 244545666),
        httpOnly:true
      });
      res.status(201).json({ message:"Successfully Login"});

    }
  
       }
       else{
        return res.status(400).json({error:"Invalid Credentials"});

       }
        
  }
  catch(err){
    console.log(err);
  }
  
  
  
  });


/* for user Logout  */

  router.post('/logout', async function(req, res, next) {
    res.clearCookie("jwtoken",{
    path:'/'
    });
    res.status(200).json({message:'User Logout'});
      
      });
  




/* for profile pic  */

router.post('/profilepic',authenticate, function(req, res, next) {
  const {imagePath,_id}=req.body;

  const file = req.files.photo;
  cloudinary.uploader.upload(file.tempFilePath,(err,result)=>{
    console.log(result);
    imagePath=result.url;
    const userId = await user.findById({_id:_id});

    if(!userId){
     return res.status(422).json({error:"error"});
    }
     else{
       const user = new User({imagePath});
       await user.save();
       res.status(201).json({data : user, message:"Successfully Profile Pic Upload"});
     }


  });

});

router.put('/profilepic',authenticate, function(req, res, next) {
  const {imagePath,_id}=req.body;

  const file = req.files.photo;
  cloudinary.uploader.upload(file.tempFilePath,(err,result)=>{
    console.log(result);
    imagePath=result.url;
    const userId = await user.findByIdAndUpdate({_id:_id});

    if(!userId){
     return res.status(422).json({error:"error"});
    }
     else{
       const user = new User({imagePath});
       await user.save();
       res.status(201).json({data : user, message:"Successfully Profile Pic Updated"});
     }


  });

});

router.delete('/profilepic',authenticate, function(req, res, next) {
  const {imagePath,_id}=req.body;

    const userId = await user.findByIdAndRemove({_id:_id});

    if(!userId){
     return res.status(422).json({error:"error"});
    }
     else{
       const user = new User({imagePath});
       await user.remove();
       res.status(201).json({data : user, message:"Successfully Profile Pic Remove"});
     }

});
 


  

module.exports = router;
