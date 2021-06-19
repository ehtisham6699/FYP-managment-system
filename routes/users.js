const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const methodOverride = require("method-override");
// Load User model
const User = require("../models/User");
const {
  forwardAuthenticated,
  ensureAuthenticated,
  authRole,
} = require("../config/auth");
router.use(methodOverride("_method"));
// Login Page
router.get("/login", forwardAuthenticated, (req, res) => res.render("login"));

router.get("/add_user", ensureAuthenticated, authRole("admin"), (req, res) =>
  res.render("admin/add_user", { user: req.user })
);

router.get("/studentslist", ensureAuthenticated, (req, res) => {
  //  const userloggedin= User.findById(req.params.id)
  User.find({}).exec(function (err, data) {
    if (err) throw err;
    res.render("General/studentslist", { user: req.user, data: data });
  });
});
router.get("/supervisorlist", ensureAuthenticated, (req, res) => {
  //  const userloggedin= User.findById(req.params.id)
  User.find({}).exec(function (err, data) {
    if (err) throw err;
    res.render("General/supervisorlist", { user: req.user, data: data });
  });
});

router.get("/add_supervisor", (req, res) => res.render("admin/add_supervisor"));
// Register Page
router.get("/register", forwardAuthenticated, (req, res) =>
  res.render("register")
);

//update page
router.get("/update/:id", ensureAuthenticated, async (req, res) => {
  const userloggedin = await User.findById(req.params.id);

  const user = await User.findById(req.user.id);
  res.render("update", { user, userloggedin });
});
//update page post
router.put("/:id", authRole("admin"), async (req, res) => {
  // const user = users.find((c) => c.id === parseInt(req.params.id));
  const { name, email } = req.body;
  let errors = [];

  var user = await User.findById(req.user.id);
  var userloggedin = await User.findById(req.params.id);

  if (!name || !email) {
    errors.push({ msg: "Please enter all fields" });
  }
  if (errors.length > 0) {
    res.render("update", {
      userloggedin,
      user: user,
      errors,
      name,
      email,
    });
  } else {
    const userUpdate = await User.findByIdAndUpdate(
      userloggedin,
      { name, email },
      { new: true }
    );
    res.redirect("/dashboard");
  }
  // user.name = req.body.name;
});
// Register
router.post("/add_user", ensureAuthenticated, (req, res) => {
  const { name, email, password, password2, role, rollno } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please enter all fields" });
  }

  if (password != password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.render("admin/add_user", {
      errors,
      rollno,
      name,
      role,
      email,
      password,
      password2,
      user: req.user,
    });
  } else {
    User.findOne({ email: email }).then((user) => {
      if (user) {
        errors.push({ msg: "Email already exists" });
        res.render("admin/add_user", {
          errors,
          rollno,
          role,
          name,
          email,
          password,
          password2,
          user: req.user,
        });
      } else {
        const newUser = new User({
          name,
          rollno,
          role,
          email,
          password,
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then((user) => {
                req.flash("success_msg", "User is registered");
                res.redirect("/users/add_user");
              })
              .catch((err) => console.log(err));
          });
        });
      }
    });
  }
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/users/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success_msg", "Welcome " + req.user.name);
    res.redirect("/dashboard");
  }
);

//update

// Logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/users/login");
});

router.delete("/?:id", authRole("admin"), async (req, res) => {
  const user = await User.findByIdAndRemove(req.params.id);
  // const user = users.find((c) => c.id === parseInt(req.params.id));
  if (!user) {
    req.flash("error_msg", "no id found");
  }
  res.redirect("/users/studentslist");
});

//results

router.get("/results", (req, res) => {
  User.findById(req.user.id).exec(function (err, data) {
    if (err) throw err;
    res.render("General/results", { user: req.user, data: data });
  });
});

// availablity

router.post("/availablity/?:id", (req, res) => {
  const availablity = req.body.availablity;
  User.findByIdAndUpdate(
    req.params.id,
    {
      available: availablity,
    },
    (err, count) => {
      console.log(err);
    }
  );
  res.redirect("/dashboard");
});
module.exports = router;

// Login page
// router.post('/login', (req, res, next) => {
//   passport.authenticate('local', {
//     successRedirect: '/dashboard',
//     failureRedirect: '/users/login',
//     failureFlash: true
//   })(req, res, next);

//     req.flash("success", "Welcome back!");
// });

// router.get('/loginz',(req, res, next) => {
//   var user=User.find();
//   user.exec(function(err, data){
//     if(err) throw err;
//     // res.render("/dashboard",{data:data}
//     console.log(data);
//   })

// })
