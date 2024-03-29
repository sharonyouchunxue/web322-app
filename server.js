/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Chunxue You   Student ID: 127632214   Date: November 03, 2022
*
*  Online (Cyclic) Link: https://stormy-plum-headscarf.cyclic.app
********************************************************************************/ 

const express = require('express');
const blogData = require("./blog-service");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const exphbs = require("express-handlebars");
const path = require("path");
const stripJs = require('strip-js');
const authData = require('./auth-service.js')
const clientSessions = require("client-sessions");

const app = express();

const HTTP_PORT = process.env.PORT || 8080;

cloudinary.config({
    cloud_name: 'dfgkzuqrx',
    api_key: '758846984273596',
    api_secret: 'bk4oYz0ejivJ2l3YZtTxVvpv0es',
    secure: true
})

const upload = multer();

//// added the app.engine() code using exphbs.engine({ ... }) and the "extname"
app.engine(".hbs", exphbs.engine({
    extname: ".hbs",
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
        },
            // added another helper -- formatDate
            formatDate: function (dateObj) {
                //console.log(typeof dateObj);
                let year = dateObj.getFullYear();
                let month = (dateObj.getMonth() + 1).toString();
                let day = dateObj.getDate().toString();
                return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
            }
        }
    })
    );

app.set('view engine', '.hbs');

// adding regular express.urlencoded() middleware
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.use(clientSessions({cookieName: "session",
                        secret: "web322_week8",
                        duration: 2 * 60 * 1000, 
                        activeDuration: 60 * 1000
                    })
                    );
//custom middileware to add session to all the views(res)
app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});
//helper middleware(ensure login)
//make sure the user is logged in
function ensureLogin(req,res,next){
    if(!req.session.user){
        res.redirect("/login");
    }
    else{
        next();
    }
}

app.use(function (req, res, next) {let route = req.path.substring(1);
app.locals.activeRoute ="/" +(isNaN(route.split("/")[1])? route.replace(/\/(?!.*)/, ""): route.replace(/\/(.*)/, ""));
app.locals.viewingCategory = req.query.category;
next();
});

app.get('/', (req, res) => {
    res.redirect("/blog");
});

app.get('/about', (req, res) => {
    res.render("about");
});

// adding the "/blog" route

app.get('/blog', async (req, res) => {
    // Declare an object to store properties for the view
    let viewData = {};
    try{
        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blogData.getPublishedPosts();
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
        let categories = await blogData.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})

});
// updated the "/posts" route
app.get('/posts', ensureLogin,(req, res) => {
    if (req.query.category) {
        blogData.getPostsByCategory(req.query.category)
                .then((data) => {
                    if (data.length > 0) res.render("posts", { posts: data });
                    else res.render("posts", { message: "no results" });
                })
                .catch((err) => {res.render("posts", { message: "no results" });
            });} else if (req.query.minDate) {
                blogData.getPostsByMinDate(req.query.minDate).then((data) => {
                    if (data.length > 0) res.render("posts", { posts: data });
                    else res.render("posts", { message: "no results" });
                })
                .catch((err) => {res.render("posts", { message: "no results" });});} 
                else {blogData.getAllPosts().then((data) => {
                    if (data.length > 0) res.render("posts", { posts: data });
                    else res.render("posts", { message: "no results" });
                }).catch((err) => {res.render("posts", { message: "no results" });
            });
        }
    });

app.post("/posts/add", upload.single("featureImage"), (req,res)=>{
    if(req.file){
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
    
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
    
        upload(req).then((uploaded)=>{
            processPost(uploaded.url);
        });
    }else{
        processPost("");
    }

    function processPost(imageUrl){
        req.body.featureImage = imageUrl;
        blogData.addPost(req.body).then(post=>{
            res.redirect("/posts");
        }).catch(err=>{
            res.status(500).send(err);
        })
    }   
});

//Updating the "Categories" List when Adding a new Post
//"/posts/add" route
app.get('/posts/add',ensureLogin, (req, res) => {
     blogData.getCategories()
     .then(data => res.render("addPost", {categories: data}))
     .catch(err => res.render("addPost", {categories: []}))
    
 });


app.get('/post/:id',ensureLogin, (req,res)=>{
    blogData.getPostById(req.params.id).then(data=>{
        res.json(data);
    }).catch(err=>{
        res.json({message: err});
    });
});

app.get('/blog/:id',ensureLogin, async (req, res) => {
    // Declare an object to store properties for the view
    let viewData = {};
    try{
        // declare empty array to hold "post" objects
        let posts = [];
        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blogData.getPublishedPosts();
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
        viewData.post = await blogData.getPostById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blogData.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }
    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})
});

//update categories route
app.get('/categories',ensureLogin, (req, res) => {
    blogData.getCategories().then((data => {
        if(data.length > 0) res.render("categories", {categories: data});
        else res.render("categories", { message: "no results" });
    })).catch(err => {
        res.render("categories", {message: "no results"});
    });
});

//Updating Routes (server.js) to Add / Remove Categories & Posts
app.get("/categories/add",ensureLogin, function (req, res) {
    res.render("addCategory");
});

app.post("/categories/add", function (req, res) {
    blogData.addCategory(req.body).then(() => {
        res.redirect("/categories");
    });
});

app.get("/categories/delete/:id",ensureLogin, function (req, res) {
    blogData.deleteCategoryById(req.params.id)
       .then(res.redirect("/categories"))
       .catch((err) =>res.status(500).send("Unable to Remove Category / Category not found")
       );
    });

app.get("/posts/delete/:id",ensureLogin, function (req, res) {
    blogData.deletePostById(req.params.id)
        .then(res.redirect("/posts"))
        .catch((err) =>res.status(500).send("Unable to Remove Post / Post not found"));
    });

//create login route
app.get("/login",function(req,res){
    res.render('login');
});
//create registration route
app.get("/register", function(req,res){
    res.render('register');
})

//todo: post login route
app.post("/login",(req,res)=>{
    req.body.userAgent = req.get('User-Agent');
    authData.checkUser(req.body).then((user)=>{
        req.session.user = {
            userName: user.userName,
            email: user.email,
            loginHistory: user.loginHistory
        }
        res.redirect('/posts');
    }).catch((err)=>{
        res.render("login", {errMessage: err,userName: req.body.userName});
    });
});

//post for register
app.post("/register",function(req,res){
    authData.registerUser(req.body)
    .then(()=> res.render('register', {successMessage: "User created"}))
    .catch((err)=> res.render('register',{errorMessage: err, userName: req.body.userName} ))
});

//reset rout for logout
app.get("/logout",ensureLogin,(req,res)=>{
    req.session.reset();
    res.redirect('/');
})

//rout for userHistory
app.get("/userHistory", ensureLogin, function (req, res) {
    res.render('userHistory');
});

app.use((req, res) => {
    res.status(404).render("404");
})

//Adding authData.initialize to the "startup procedure":
blogData.initialize()
.then(authData.initialize)
.then(function(){
    app.listen(HTTP_PORT, () => {
        console.log('server listening on: ' + HTTP_PORT);
    });
}).catch((err) => {
    console.log("unable to start server: " + err);
});
