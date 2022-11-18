const Sequelize = require('sequelize');
var sequelize = new Sequelize('hsfvycbe', 'hsfvycbe', 'B3NCaoarx591NqaF4Ec4rCuUHQKWc1Xl', {
    host: 'peanut.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

// data modelsconst 
//Post
const Post = sequelize.define("Post", {
     id:{
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
 },
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN,
});
//Category
const Category = sequelize.define("Category", {
     id:{
         type:Sequelize.INTEGER,
         primaryKey:true,
         autoIncrement:true
     },
    category: Sequelize.STRING,
});

//•	belongsTo Relationship
//This will ensure that our Post model gets a "category" column that will act as a foreign key to the 
//Category model.  When a Category is deleted, any associated Posts will have a "null" value set to their "category" foreign key.
Post.belongsTo(Category, { foreignKey: "category" });

//initialize()
module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        sequelize.sync()
             .then(resolve("database synced!"))
             .catch(reject("Unable to sync the database!"));
            });
            };

//getallPosts()
module.exports.getAllPosts = function(){
    return new Promise((resolve, reject) => {
        sequelize
           .sync()
           .then(resolve(Post.findAll()))
           .catch(reject("no results returned!"));
        });
    };
    
//getPostsByCategory()
module.exports.getPostsByCategory = function(category){
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                category: category,
            },
        })
        .then(resolve(Post.findAll({ where: { category: category } })))
        .catch(reject("no results returned!"));
    });
};

//getPostsByMinDate()
module.exports.getPostsByMinDate = function(minDateStr) {
    return new Promise((resolve, reject) => {
    const { gte } = Sequelize.Op;
    Post.findAll({
        where: {
            postDate: {
                [gte]: new Date(minDateStr),
            },
        },
    }).then(
        resolve(
            Post.findAll({ where: { 
                postDate: { 
                    [gte]: new Date(minDateStr) 
                } } })
                )
                )
            .catch(reject("no results returned!"));
        });
    };

    //getPostById()
module.exports.getPostById = function(id){
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                id: id,
            },
        }).then((data) => {resolve(data[0]); // return a single object
    })
    .catch(() => reject("no results returned!"));
});
};

//addPost()
module.exports.addPost = function(postData){
    return new Promise((resolve,reject)=>{
        postData.published = (postData.published) ? true : false;
        for (var i in postData) {
            if (postData[i] == "") postData[i]= null;    
        }
        postData.postDate = new Date();
        Post.create(postData)
            .then(resolve(Post.findAll()))
            .catch(reject("Unable to create post!"));
        });
    }  

//getPublishedPosts()
module.exports.getPublishedPosts = function(){
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                published: true,
            },
        }).then((data) => {resolve(data);
        }).catch(() => "no results returned!");
    });
};
    
//getPublishedPostsByCategory()
module.exports.getPublishedPostsByCategory = function(category){
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                published: true,
                category: category,
            },
        }).then(resolve(
            Post.findAll({ where: { published: true, category: category } })
            )
            ).catch(reject("no results returned!"));
        });
    };
        
//getCategories()
module.exports.getCategories = function(){
    return new Promise((resolve, reject) => {
        Category.findAll()
        .then((data) => {
            resolve(data);
        }).catch((err) => {
            reject(err);
        });
    });
};

//Adding new blog-service.js functions delete Posts and Categories. 
//add (promise-based) functions 
module.exports.addCategory = (categoryData) => {
    return new Promise((resolve, reject) => {
        for (var i in categoryData) {
            if (categoryData[i] == "") {
            categoryData[i] = null;
        }
    }
            Category.create(categoryData)
               .then(resolve(Category.findAll()))
               .catch(reject("Unable to create category"))
        });
    };

//deleteCategoryById(id)
module.exports.deleteCategoryById = (id) => {
    return new Promise((resolve, reject) => {
        Category.destroy({
            where: {
                id: id,
            },
        }).then(resolve())
        .catch(reject("Unable to delete category"));
    });
};

//deletePostById(id)
module.exports.deletePostById = (id) => {
    return new Promise((resolve, reject) => {
        Post.destroy({
            where: {
                id: id,
            },
        })
          .then(resolve())
          .catch(reject("Unable to delete post"));
        });
    };