var mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
var Schema = mongoose.Schema;
var userSchema = new Schema({
    "userName" :{ 
    "type" : String,
    "unique" : true},
    "password" : String,
    "email" : String,
    "loginHistory" : [{
        "dateTime" : Date,
        "userAgent" : String
    }]
})
let User;

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
    let db = mongoose.createConnection("mongodb+srv://dbUser:dbpassword@senecaweb-btcrv.mongodb.net/web322DB?retryWrites=true", 
    { useNewUrlParser: true });
    db.on('error', (err)=>{
    reject(err); // reject the promise with the provided error
    });
    db.once('open', ()=>{
    User = db.model("users", userSchema);
    resolve(console.log("Mongo Connected Successfully"));
    });
    });
   }

   module.exports.registerUser = function (userData) {
       return new Promise(function(resolve,reject) {
           if(userData.password != userData.password2) {
               reject("Error: Passwords Don't Match");
           }
           else {
               bcrypt.genSalt(10,function(err,salt){
                   bcrypt.hash(userData.password, salt, function(err,hash) {
                        if(err) {reject ("There was an error encrypting the password")}
                        else {
                            userData.password = hash;
                   } 
               })
            })
               let newUser = new User(userData);
               newUser.save()
               .then(() => {
                   resolve();
               }).catch(err => {
                   if(err.code == 110000) {
                       reject("User Name already Taken");
                   }
                   else {
                       reject(`There was an error creating the user: ${err}`);
                   }
               })
           }
       })
   } 

   module.exports.checkUser = function (userData) {
       return new Promise (function(resolve,reject) {
           User.find({userName : userData.userName})
           .then((users) => {
               if(users.length == 0) {
                   reject(`Unable to Find User: ${userData.userName}`);
               }
               else {
                   bcrypt.compare(userData.password,users[0].password)
                   .then((res) => {
                   users[0].loginHistory.push({dateTime : (new Date()).toString(), userAgent: userData.userAgent});
                   User.updateOne({userName : users[0].userName },
                   {$set: {loginHistory: users[0].loginHistory } },
                   {multi : false}) 
                   .exec()
                   .then(() => {
                       resolve(users[0]);
                   }).catch((err) => {
                       reject(`There was an error verifying the user: ${err}`);
                   })
                }).catch((err) => {
                    reject(`Incorrect Password for user: ${err}`);
                })
               }
           }).catch((err) => {
               reject(`Unable to find user: ${userData.userName}`);
           })
       })
   }

