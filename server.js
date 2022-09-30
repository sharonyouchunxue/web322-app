/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Chunxue You   Student ID: 127632214   Date: September 29, 2022
*
*  Online (Cyclic) Link: https://stormy-plum-headscarf.cyclic.app
********************************************************************************/ 

var express = require("express");
var app = express();
var path = require("path");
var blogService = require("./blog-service.js");

var HTTP_PORT = process.env.PORT || 8080;
console.log("Express http sever listening on" + HTTP_PORT);

app.use(express.static('public'));
//setup a 'route' to listen on the default url path(http://localhost)

app.get("/", function(req,res){
    res.redirect("/about");
});

app.get("/about", function(req,res){
    res.sendFile(path.join(__dirname,"/views/about.html"));
});


  
app.get("/blog", function (req, res) {
    blogService.getPublishedPosts().then((data) => {
        res.json(data);
    }).catch((err) => {
        res.json(err);
    })
    });
app.get("/categories", function (req, res) {
      blogService.getCategories().then((data) =>{
      res.json(data);
    }).catch((err) => {
      res.json(err);
    })
});
app.get("/posts",function(req,res) {
    blogService.getAllPosts().then((data) => {
        res.json(data);
    }).catch((err) => {
            res.json(err);
    })
});

 app.use(function(req, res){
     res.status(404).json({
    status: 'error',
     error: {
         message: 'Page not found',
         code: 404,
      },
     });
   });

// setup http server to listen on HTTP_PORT
//app.listen(HTTP_PORT);   
blogService.initialize().then(() => {
    app.listen(HTTP_PORT);
}).catch(err => {
    console.log("couldn't start server"+ err);
})