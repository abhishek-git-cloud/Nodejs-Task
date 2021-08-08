var mongoose = require('mongoose');
var dotenv = require('dotenv');

dotenv.config({path:'./config.env'});
const db_url = process.env.DATABASE;

mongoose.connect(db_url,{
  useNewUrlParser:true,
  useCreateIndex:true,
  useUnifiedTopology:true,
  useFindAndModify:false
}).then(()=>{
  console.log("Successful Connect with DB");
}).catch((err)=> console.log("connection error"+ err));
