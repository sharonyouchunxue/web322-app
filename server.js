var express = require("express");
const { Server } = require("http");
var app = express();
var path = require("path");
var blogService = require("./blog-service");

var HTTP_PORT = process.env.PORT || 8080;

function onHttpStart() {
console.log("Express http sever listening on" + HTTP_PORT);
}

app.use(express.static('public'));
//setup a 'route' to listen on the default url path(http://localhost)
 app.get("/blog", function(req,res){
    res.send("get all posts who have published==true");
 });

 app.get("/posts", function(req,res){
    res.sendFile(path.join(__dirname, "data/posts.json"));
 })

 app.get("/categories", function(req,res){
     res.sendFile(path.join(__dirname, "data/categories.json"));
 })

app.get("/", function(req,res){
    res.redirect("/about");
});

// setup another route to listen on/about
app.get("/about", function(req,res){
    res.sendFile(path.join(__dirname,"views/about.html"));
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
    app.listen(HTTP_PORT, onHttpStart);
}).catch(err => {
    console.log(err);
})

app.get("/blog", function (req, res) {
    blogService.getPublishedPosts().then((data) => {
        res.json(data);
    }).catch((err) => {
        res.json(err);
    })
});

app.get("/posts", function (req, res) {
    if(req.query.category){
      blogService.getPostsByCategory(req.query.category).then((data) =>{
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
    });
}
});

app.get("/categories", function (req, res) {
    blogService.getCategories().then((data) => {
        res.json(data);
    }).catch((err) => {
        res.json(err);
    })
});
