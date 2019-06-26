/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

// ======
// MODELS
// ======
// Using mongoose
const mongoose = require("mongoose");
mongoose.connect(CONNECTION_STRING, function(err, db){
  if(err){
    console.log(err);
  } else {
    console.log("connected to database " + db.name);
  }
});

// Comments
var bookCommentSchema = new mongoose.Schema({
  comment: String
});
var BookComment = mongoose.model("BookComment", bookCommentSchema);
// Book
var bookSchema = new mongoose.Schema({
  title: String,
  commentcount: {
    type: Number,
    default: 0
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BookComment"
    }
  ]
});
var Book = mongoose.model("Book", bookSchema);



// ========
//  Routes
// ========

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      // STILL NEED TO FIX THE COMMENTLENGTH BIT
      Book.find({})
        .populate("comments")
        .exec(function(err, allBooks){
          if(err){
            console.log(err);
          } else {
            res.json(allBooks);
          }
      })
      
    })
    
    .post(function (req, res){
      var title = req.body.title;
      var newBook = {title: title};
      // Check that a title has been entered
      if(title===""){
        return res.send("no title given");
      }
      //response will contain new book object including atleast _id and title
      Book.create(newBook, function(err, addedBook){
        if(err){
          console.log(err);
        } else {
          console.log("New book " + addedBook.title + " added.");
          res.json(addedBook);
        }
      });
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      Book.remove({}, function(err){
        if(err){
          console.log(err);
        } else {
          res.send("complete delete successful")
        }
      })
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      console.log(req.params.id)
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      Book.findById(bookid)
        .populate("comments")
        .exec(function(err, foundBook){
          if(err){
            // Disable error logging for tests
            // console.log(err);
            return res.send("no book exists");
          } else {
            res.json(foundBook);
          }
      })
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      var newComment = {comment: comment};
      //json res format same as .get
      Book.findById(bookid)
        .populate("comments")
        .exec(function(err, foundBook){
        if(err){
          console.log(err);
          res.send("no book exists");
        } else {
          BookComment.create(newComment, function(err, addedComment){
            if(err){
              console.log(err);
            } else {
              foundBook.comments.push(addedComment);
              var commentCount = foundBook.comments.length;
              foundBook.commentcount = commentCount;
              foundBook.save();
              res.json(foundBook);
            }
          })
        }
      })
    })
    
  
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      Book.findByIdAndRemove(bookid, function(err){
        if(err){
          console.log(err);
          res.send("no book exists");
        } else {
          console.log("Delete Successful");
          res.send("delete successful");
        }
      })
    });
  
};
