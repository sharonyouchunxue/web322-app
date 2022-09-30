const fs = require("fs");
//initialize posts and categories to arrays globally
var postsArray = [];
var categoriesArray = [];

module.exports.initialize = function(){
return new Promise((resolve, reject) => {
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
resolve("success");
})
}

//getAllPosts function to check if the length of the array is 0, then no result returned
module.exports.getAllPosts = function () {
    return new Promise((resolve, reject) => {
        if(postsArray.length === 0) {
            reject("no results returned");
        }
            resolve (postsArray);
        })
        }

//getPublishedPosts() 
module.exports.getPublishedPosts = function () {
    return new Promise((resolve, reject) => {
        var publishedPosts = [];
        for (let i=0; i < postsArray.length; i++){
            if (postsArray[i].published === true) {
                publishedPosts.push(postsArray[i]);
             } 
        }
     if(publishedPosts.length === 0) {
        reject("no results returned");
    }
    else{
          resolve (publishedPosts);
    }
})
}

//getCategories() function to check if the length of the array is 0, then no result returned
module.exports.getCategories = function () {
    return new Promise((resolve, reject) => {
        if(categoriesArray.length === 0) {
            reject("no results returned");
        }
        else{
        resolve (categoriesArray);
    }
    })
}


        













