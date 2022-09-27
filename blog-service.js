const fs = require("fs");
//initialize posts and categories to arrays globally
var postsArray = [];
var categoriesArray = [];

module.exports.initialize = function(){
var promise = new Promise((resolve, reject) => {
    try { fs.readFile('./data/posts.json', (err, data) => {
        if (err) 
        throw err;
        postsArray = JSON.parse(data);
        console.log("posts initialized");
    })
    fs.readFile('./data/categories.json', (err, data) => {
        if (err) 
        throw err;
        categoriesArray = JSON.parse(data);
        console.log("categories initialized");
    })
} catch (ex) {
    console.log("unable to read file");
    reject("unable to read file");
}
console.log("success");
resolve("success");
})
return promise;
};

//getAllPosts function to check if the length of the array is 0, then no result returned
module.exports.getAllPosts = function () {
    var promise = new Promise((resolve, reject) => {
        if(postsArray.length === 0) {
            var err = "no results returned";
            reject({message: err});
        }
            resolve (postsArray);
        })
            return promise;
        };

//getPublishedPosts() 
module.exports.getPublishedPosts = function () {
    var postsArray = [];
    var promise = new Promise((resolve, reject) => {
        for (var i=0; i < postsArray.length; i++){
            if (postsArray[i].published == true) {
                categoriesArray.push(postsArray[i]);
            } 
}
if(categoriesArray.length === 0) {
    var err = "no results returned";
    reject({categoriesArray: err});
}
resolve (categoriesArray);
})
return promise;
};

//getCategories() function to check if the length of the array is 0, then no result returned
module.exports.getCategories = function () {
    var promise = new Promise((resolve, reject) => {
        if(categoriesArray.length === 0) {
            var err = "no results returned";
            reject({message: err});
        }
        resolve (categoriesArray);
    })
    return promise;
};


        













