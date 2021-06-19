module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      
   return   next()
    
    }
    req.flash('error_msg', 'Please log in to view that resource');
    res.redirect('/users/login');
  },
  forwardAuthenticated: function(req, res, next) {
    if (!req.isAuthenticated()) {
     
      return next();
    }
   
    res.redirect('/dashboard');  
 
  },

  authRole:  function (role) {
    return  (req, res, next) => {
      if (req.user.role===role || req.user.id === req.params.id) {
        next();
        
      } else{
        req.flash('error_msg', 'your are not authorized');
        // res.redirect('/users/update/'+ req.params.id);  
        res.redirect('/dashboard');  
      }
  }
}


}
  
