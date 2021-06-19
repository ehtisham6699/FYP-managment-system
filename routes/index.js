const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated ,authRole} = require('../config/auth');
const User = require('../models/User');

const Post = require('../models/Post');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));
router.get('/new', forwardAuthenticated, (req, res) => res.render('new_dashboard'));
// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>{
// function canDeleteProject(user, project) {
//   return project.userId === user.id
// }
var post={};
var data={};
Post.find({},function (err, data){
  if(err) throw err;
  else{
   post=data;
  }

User.find({}).exec(function (err, userdata){
    if(err) throw err;
   else{
    data=userdata;
    res.render('dashboard', {
      user: req.user,
      post:post,
      data:data,
      newfriend: req.user.request
    })
   }
  
  })
 
});


})

module.exports = router;

// Recetas.find({}).exec(function (err, recetas) { if(err) { ... } Autores.find({}, function (err, autores) { if(err) { ... } res.render('index', { recetas: recetas, autores: autores }); }); });