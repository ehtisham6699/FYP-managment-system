const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const methodOverride = require('method-override')
const { forwardAuthenticated ,ensureAuthenticated,authRole} = require('../config/auth');
const Post = require('../models/Post');
router.use(methodOverride('_method'))


router.get('/add_fypguidelines',ensureAuthenticated,(req, res) => 
res.render('admin/add_fypguidelines',{user:req.user}
));
router.post('/add_fypguidelines',ensureAuthenticated, (req, res) => {
    const { name, title,content,date} = req.body;
  
          const newPost = new Post({
            title,
            name,
            date,
            content
          });

              newPost.save()
                .then(post => {
                  req.flash(
                    'success_msg',
                    'Post submitted'
                  );
                  res.redirect('/posts/add_fypguidelines');
                })
                .catch(err => console.log(err));
           
          
        // }
      });
  
      router.delete('/?:id',async(req, res) => {
        const post= await Post.findByIdAndRemove(req.params.id)
        // const user = users.find((c) => c.id === parseInt(req.params.id));
        if (!post) {
          req.flash('error_msg', 'no id found');
        }
        res.redirect('/dashboard');
      });


module.exports=router;