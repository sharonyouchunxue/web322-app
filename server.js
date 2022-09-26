var express = require("express");
const { Server } = require("http");
var app = express();
var path = require("path");
var blog = require("./blog-service");

var HTTP_PORT = process.env.PORT || 8080;

console.log("Express http sever listening on" + HTTP_PORT);

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
app.listen(HTTP_PORT);
    
/*app.listen(HTTP_PORT, function(){
    var promise = new Promise((resolve, reject) => {
        if(blog.initialize()
        .then(() => {{ start the server}
        console.log();
    })
    .catch((err) => {
        console.error(err);
        return promise;
 */