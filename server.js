/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Chunxue You   Student ID: 127632214   Date: September 29, 2022
*
*  Online (Cyclic) Link: 
********************************************************************************/ 
var express = require("express");
var app = express();
var path = require("path");
var blogService = require('./blog-service.js');
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
var HTTP_PORT = process.env.PORT || 8080;
cloudinary.config({
    cloud_name: 'dfgkzuqrx',
    api_key: '758846984273596',
    api_secret: 'bk4oYz0ejivJ2l3YZtTxVvpv0es',
    secure: true
})

const upload = multer(); // no { storage: storage }
function onHttpStart() {
 console.log("Express http server listening on: " + HTTP_PORT);
}
app.use(express.static('public'));
app.get("/", function (req, res) {
    res.redirect("/about");
});

app.get("/about", function (req, res) {
    res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get("/posts/add", function (req, res) {
   res.sendFile(path.join(__dirname, "/views/addPost.html"));
});

app.get("/blog", function (req, res) {
   blogService.getPublishedPosts().then((data) => {
   res.json(data);
 }).catch((err) => {
   res.json(err);
 })
});

app.get("/posts", function (req, res) {
 if(req.query.category) {
    blogService.getPostsByCategory(req.query.category).then((data) =>{
    res.json(data);
 }).catch((err) => {
    res.json(err);
 })
 }
 else if(req.query.minDate){
   blogService.getPostsByMinDate(req.query.minDate).then((data) =>{
    res.json(data);
 }).catch((err) => {
    res.json(err);
 })
 }
 else{
   blogService.getAllPosts().then((data) => {
   res.json(data);
 }).catch((err) => {
   res.json(err);
 })
 }

});
app.get("/post/:value", (req, res) => {
   blogService.getPostsById(req.params.value).then((data) => {
   res.json(data);
 })
 .catch((err) => {
   res.json(err);
 })
});
app.get("/categories", function (req, res) {

   blogService.getCategories().then((data) => {
   res.json(data);
 }).catch((err) => {
   res.json(err);
 })
});

app.post('/posts/add', upload.single("featureImage"), function (req, res, next)
{
   if(req.file) {
       let streamUpload = (req) => {
       return new Promise((resolve, reject) => {
       let stream = cloudinary.uploader.upload_stream((error, result) => {
   if (result) {
        resolve(result);
 } else {
        reject(error);
 }
 });
 streamifier.createReadStream(req.file.buffer).pipe(stream);
 });
 };
 async function upload(req) {

    let result = await streamUpload(req);
    console.log(result);
    return result;
 };
 upload(req).then((uploaded)=>{

    processPost(uploaded.url);
 });
 }
   else {
     processPost("");
    }

 function processPost(imageUrl){
 req.body.featureImage = imageUrl;
 // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
 };
 blogService.addPost(req.body).then(() => {
 res.redirect("/posts");
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

