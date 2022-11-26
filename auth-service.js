const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

//create a mongodb to save user information
let Schema = mongoose.Schema;

let userSchema = new Schema({
    "userName": {
        type: String,
        unique: true
    }, 
    "password": String,
    "email": String,
    "loginHistory":[{
        "dateTime": Date,
        "userAgent": String
    }]   
  });
// to be defined on new connection (see initialize)
let User;

//auth-service.js - Exported Functions
module.exports.initialize=function(){
    return new Promise(function (resolve,reject){
        let db = mongoose.createConnection("mongodb+srv://webdbUser:Ycx1043*@senecaweb.sbxfgyf.mongodb.net/web322_week8", { useNewUrlParser: true });
        db.on('error',(err)=>{
            reject(err);// reject the promise with the provided error
        });
        db.once('open',()=>{
            User = db.model("users",userSchema);
            resolve("Successfully connected to database!");
        });
    });
}

//function that allows user to register
module.exports.registerUser = function(userData){
    return new Promise(function(resolve,reject){
        if(userData.password != userData.password2){
            reject("Password do not match");
        }else{
            bcrypt.hash(userData.password,10).then(hash=>{
                userData.password = hash;
                let newuser = new User(userData);
                newuser.save((err)=>{
                    if(err){
                        if(err.code == 11000){
                            reject("User Name already taken");
                        }else{
                            reject("There was an error creating the user: "+err);
                        }
                    }else{
                        resolve();
                    }
                });
            }).catch(err=>{
                redirect('problem encrypting the password');
            });
        }
    })
}
//function that control user trying to login
module.exports.checkUser = function(userData) {
    return new Promise(function (resolve, reject) {
        User.find({ userName: userData.userName }).exec()
        .then((users) => {
            if (users.length == 0) {
                reject("Username does not exists: " + userData.userName);
            } else {
                bcrypt.compare(userData.password, users[0].password).then((res)=>{
                    if (res === true) {
                        if (users[0].loginHistory == null)
                            users[0].loginHistory = []; // make array if none exists (first login)

                        users[0].loginHistory.push({ 
                            dateTime: (new Date()).toString(),
                            userAgent: userData.userAgent
                        });
                        
                        // using updateOne instead of update
                        User.updateOne({ userName: users[0].userName },
                            { $set: { loginHistory: users[0].loginHistory } }
                        ).exec()
                        .then(function() { 
                            resolve(users[0]);
                        })
                        .catch(function(err) { 
                            reject("There was an error verifying the username: " + err);
                        });
                    } else if (res === false) {
                        reject("Unable to find username: " + userData.userName);
                    }
                });
            
            }
        })
        .catch(function() {
            reject("Unable to find user: " + userData.userName);
        }); 
    
    })
}

