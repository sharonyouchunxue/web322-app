const fs = require('fs');
const express = require("express");
const { resolve } = require('path');
//initialize posts and categories to arrays globally
var postsArray = [];
var categoriesArray = [];
 module.exports.initialize = function(){
 return new Promise((resolve, reject) => {
     try { fs.readFile('./data/posts.json', (err, data) => {
         if (err) 
         throw err;
        postsArray = JSON.parse(data);
         console.log("posts read");
     })
     fs.readFile('./data/categories.json', (err, data) => {
         if (err) 
       throw err;
        categoriesArray = JSON.parse(data);
        console.log("categories read");
     })
 } catch (err) {
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

module.exports.addPost = function(postData){
    return new Promise((resolve, reject) => {
        postData.id = postsArray.length +1;
        postData.published = (postData.published)? true: false;
        postsArray.push(postData);
        resolve();     
    });
};

module.exports.getPostsByCategory = (category)=>{
    return new Promise((resolve,reject) => {
        let filteredPosts = postsArray.filter((post)=>post.category==category);
        if(filteredPosts.length == 0){
            reject("no result returned");
        }else {
            resolve(filteredPosts);
        }
    });
};
 
module.exports.getPostsByMInDate = (minDateStr) =>{
    return new Promise((resolve,reject)=>{
        let filteredPosts = postsArray.filter(
            (post) => new Date(post.postDate) >= new Date(minDateStr)
        );
        if(filteredPosts.length == 0){
            reject("no result returned");
        }
        else {
            resolve(filteredPosts);
        }
    });
};

module.exports.getPostById = (Id) =>{
    return new Promise((resolve,reject) => {
    let filteredPosts = postsArray.filter((post)=>post.id== Id);
    if(filteredPosts.length == 0){
        reject("no result returned");
    }else {
        resolve(filteredPosts);
    }
});
};








