/*********************************************************************************
*  WEB322 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Chunxue You   Student ID: 127632214   Date: November 03, 2022
*
*  Online (Cyclic) Link: https://stormy-plum-headscarf.cyclic.app
********************************************************************************/ 
var express = require("express");
var app = express();
var path = require("path");
var blogService = require('./blog-service.js');
const multer = require("multer");
const exphbs = require('express-handlebars');
const stripJs = require('strip-js');
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
var HTTP_PORT = process.env.PORT || 8080;

//handlebars custom "helper" 
app.engine('.hbs', 
            exphbs.engine({ 
               extname: '.hbs',
               defaultLayout: 'main',
               helpers: {
                  navLink: function(url, options){
                     return '<li' + 
                         ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
                         '><a href="' + url + '">' + options.fn(this) + '</a></li>';
                 },
                 equal: function (lvalue, rvalue, options) {
                  if (arguments.length < 3)
                      throw new Error("Handlebars Helper equal needs 2 parameters");
                  if (lvalue != rvalue) {
                      return options.inverse(this);
                  } else {
                      return options.fn(this);
                  }
              },
              safeHTML: function(context){
               return stripJs(context);
           }
              
               }
              
              
            }));
app.set('view engine', '.hbs');

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

// fixing the navigation bar to show the correct "active" item
app.use(function(req,res,next){
   let route = req.path.substring(1);
   app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
   app.locals.viewingCategory = req.query.category;
   next();
});

app.get("/", function (req, res) {
    res.redirect("/blog");
});

app.get("/about", function (req, res) {
   res.render("about");
});

app.get("/posts/add", function (req, res) {
   blogService
    .getCategories()
    .then((data) => res.render("addPost", { categories: data }))
    .catch((err) => res.render("addPost", { categories: [] }));
   });

// app.get("/blog", function (req, res) {
//    blogService.getPublishedPosts().then((data) => {
//    res.json(data);
//  }).catch((err) => {
//    res.json(err);
//  })
// });
app.get('/blog', async (req, res) => {
   // Declare an object to store properties for the view
   let viewData = {};
   try{
       // declare empty array to hold "post" objects
       let posts = [];
       // if there's a "category" query, filter the returned posts by category
       if(req.query.category){
           // Obtain the published "posts" by category
           posts = await blogService.getPublishedPostsByCategory(req.query.category);
       }else{
           // Obtain the published "posts"
           posts = await blogService.getPublishedPosts();
       }
       // sort the published posts by postDate
       posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));
       // get the latest post from the front of the list (element 0)
       let post = posts[0]; 
       // store the "posts" and "post" data in the viewData object (to be passed to the view)
       viewData.posts = posts;
       viewData.post = post;
   }catch(err){
       viewData.message = "no results";
   }
   try{
       // Obtain the full list of "categories"
       let categories = await blogService.getCategories();

       // store the "categories" data in the viewData object (to be passed to the view)
       viewData.categories = categories;
   }catch(err){
       viewData.categoriesMessage = "no results"
   }
   // render the "blog" view with all of the data (viewData)
   res.render("blog", {data: viewData})

});

// adding the "/blog/:id" route
app.get('/blog/:id', async (req, res) => {

   // Declare an object to store properties for the view
   let viewData = {};
   try{
       // declare empty array to hold "post" objects
       let posts = [];
       // if there's a "category" query, filter the returned posts by category
       if(req.query.category){
           // Obtain the published "posts" by category
           posts = await blogService.getPublishedPostsByCategory(req.query.category);
       }else{
           // Obtain the published "posts"
           posts = await blogService.getPublishedPosts();
       }
       // sort the published posts by postDate
       posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));
       // store the "posts" and "post" data in the viewData object (to be passed to the view)
       viewData.posts = posts;
   }catch(err){
       viewData.message = "no results";
   }
   try{
       // Obtain the post by "id"
       viewData.post = await blogService.getPostById(req.params.id);
   }catch(err){
       viewData.message = "no results"; 
   }
   try{
       // Obtain the full list of "categories"
       let categories = await blogService.getCategories();
       // store the "categories" data in the viewData object (to be passed to the view)
       viewData.categories = categories;
   }catch(err){
       viewData.categoriesMessage = "no results"
   }

   // render the "blog" view with all of the data (viewData)
   res.render("blog", {data: viewData})
});



app.get("/posts", function (req, res) {
 if(req.query.category) {
    blogService.getPostsByCategory(req.query.category).then((data) =>{
      if (data.length > 0) res.render("posts", { posts: data });
      else res.render("posts", { message: "no results" });
   })
   .catch((err) => {
      res.render("posts", { message: "no results" });
   });
}
 else if(req.query.minDate){
   blogService.getPostsByMinDate(req.query.minDate).then((data) =>{
      if (data.length > 0) res.render("posts", { posts: data });
      else res.render("posts", { message: "no results" });
   })
   .catch((err) => {
      res.render("posts", { message: "no results" });
   });
 }
 else{
   blogService.getAllPosts().then((data) => {
      if (data.length > 0) res.render("posts", { posts: data });
      else res.render("posts", { message: "no results" });
   })
   .catch((err) => {res.render("posts", { message: "no results" });
});
 }
});
app.get("/post/:id", (req, res) => {
   blogService.getPostsById(req.params.value).then((data) => {
   res.json(data);
 })
 .catch((err) => {
   res.json(err);
 })
});
app.get("/categories", function (req, res) {

   blogService.getCategories().then((data) => {
      if (data.length > 0) res.render("categories", { categories: data });
      else res.render("categories", { message: "no results" });
   })
   .catch((err) => {res.render("categories", { message: "no results" });
 });
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
   res.render("404", { message: "Page Not Found" });
  });
// setup http server to listen on HTTP_PORT
//app.listen(HTTP_PORT);   
blogService.initialize().then(() => {
    app.listen(HTTP_PORT);
}).catch(err => {
    console.log("couldn't start server"+ err);
})

