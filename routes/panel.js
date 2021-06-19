const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
var formidable = require("formidable");
const passport = require("passport");
const upload = require("express-fileupload");
const multer = require("multer");
const methodOverride = require("method-override");
const {
  forwardAuthenticated,
  ensureAuthenticated,
  authRole,
} = require("../config/auth");
const Group = require("../models/Group");
const path = require("path");
const User = require("../models/User");
const Panel = require("../models/Panel");
router.use(methodOverride("_method"));
var async = require("async");
const { group } = require("console");

router.get("/add_panel", ensureAuthenticated, authRole("admin"), (req, res) => {
  //  const userloggedin= User.findById(req.params.id)
  User.find({}, function (err, data) {
    if (err) throw err;
    data = data;

    Group.find({}).exec(function (err, group) {
      if (err) throw err;
      group = group;
      res.render("admin/add_panel", {
        user: req.user,
        data: data,
        groups: group,
      });
    });
  });
});

// router.get('/groups',(req, res) => {
//     var friends= [];
//   Group.find().populate('member').exec(function(err, data) {
//       if (err) throw err;

//       res.render('General/groups',{
//         user:req.user,
//         data:data,
//       });
//     })
//   });

router.post("/register", ensureAuthenticated, async (req, res) => {
  const member2 = await User.findById(req.body.member2);
  const member = await User.findById(req.body.member);
  const member3 = await User.findById(req.body.member3);
  const group1 = await Group.findById(req.body.group1);
  const group2 = await Group.findById(req.body.group2);
  const group3 = await Group.findById(req.body.group3);

  let newPanel;
  const { category, title } = req.body;

  newPanel = new Panel({
    title,
    category,
    member: [{ _id: member._id }, { _id: member2._id }],

    groups: [{ _id: group1._id }, { _id: group2._id }, { _id: group3._id }],
  });

  if (member) {
    User.findByIdAndUpdate(
      { _id: member._id },
      {
        $push: {
          Panel: {
            panelname: title,
            category: category,
            panelId: newPanel._id,
          },
        },
      },
      (err, count) => {
        console.log(err);
      }
    );
  }
  if (member2) {
    User.findByIdAndUpdate(
      { _id: member2._id },
      {
        $push: {
          Panel: {
            panelname: title,
            category: category,
            panelId: newPanel._id,
          },
        },
      },
      (err, count) => {
        console.log(err);
      }
    );
  }
  // if(member3) {
  //     User.findByIdAndUpdate({ '_id': member3._id },
  //     {
  //     '$push': {Panel: {
  //     'panelname': title,
  //     'category':category,
  //     "panelId":newPanel._id
  //     }},
  //     },(err, count) =>  {
  //         console.log(err);
  //     })
  //     }

  newPanel
    .save()
    .then((post) => {
      res.redirect("/panel/add_panel");
    })
    .catch((err) => console.log(err));
});

router.get(
  "/groups_evaluating",
  ensureAuthenticated,
  authRole("supervisor"),
  (req, res) => {
    var Docs = [];
    var groupId = [];
    var Groupcontent = [];
    User.findById(req.user.id, function (err, data) {
      if (err) throw err;

      data = data;
      async.each(
        data.Panel,
        function (data, callback) {
          Panel.findById(data.panelId, function (err, command) {
            if (command) Docs.push(command);
            callback(err);
          })
            .populate("member")
            .populate({
              path: "groups",
              populate: {
                path: "member",
                model: "User",
              },
            });
        },
        function (err) {
          // code to run on completion or err
          res.render("General/groups_evaluating", {
            user: req.user,
            data: data,
            panels: Docs,
          });
        }
      );
    });
    // Panel.find().populate('member').populate('groups').exec(function(err, data) {
    //     if (err) throw err;
    //     res.render('General/groups_evaluating',{
    //     user:req.user,
    //     data:data,
    //     });
    // })
  }
);

router.post("/groups_evaluating/:id", (req, res) => {
  const Pdressing = req.body.Pdressing;
  const Ppresentation = req.body.Ppresentation;
  const Preport = req.body.Preport;
  //for progress
  const Prdressing = req.body.Prdressing;
  const Prpresentation = req.body.Prpresentation;
  const Prreport = req.body.Prreport;
  const Prprogress = req.body.Prprogress;
  //for Final
  const fdressing = req.body.fdressing;
  const fpresentation = req.body.fpresentation;
  const freport = req.body.freport;
  const fproject = req.body.fproject;

  if (Preport) {
    var total =
      parseInt(Pdressing) + parseInt(Ppresentation) + parseInt(Preport);
    User.findByIdAndUpdate(
      req.params.id,
      {
        proposalMarks: {
          dressing: Pdressing,
          presentation: Ppresentation,
          report: Preport,
          graded: "Graded",
          total: total,
        },
      },
      (err, count) => {
        console.log(err);
      }
    );
    res.redirect("/panel/groups_evaluating");
  } else if (Prreport) {
    var total =
      parseInt(Prdressing) +
      parseInt(Prpresentation) +
      parseInt(Prreport) +
      parseInt(Prprogress);
    User.findByIdAndUpdate(
      req.params.id,
      {
        progressMarks: {
          dressing: Prdressing,
          presentation: Prpresentation,
          report: Prreport,
          progress: Prprogress,
          graded: "Graded",
          total: total,
        },
      },
      (err, count) => {
        console.log(err);
      }
    );
    res.redirect("/panel/groups_evaluating");
  } else if (freport) {
    var total =
      parseInt(fdressing) +
      parseInt(fpresentation) +
      parseInt(freport) +
      parseInt(fproject);
    User.findByIdAndUpdate(
      req.params.id,
      {
        finalMarks: {
          dressing: fdressing,
          presentation: fpresentation,
          report: freport,
          project: fproject,
          graded: "Graded",
          total: total,
        },
      },
      (err, count) => {
        console.log(err);
      }
    );
    res.redirect("/panel/groups_evaluating");
  }
});
router.delete("/?:id", async (req, res) => {
  const panel = await Panel.findByIdAndRemove(req.params.id);
  // const user = users.find((c) => c.id === parseInt(req.params.id));
  if (!panel) {
    req.flash("error_msg", "no id found");
  }
  res.redirect("/panel/groups_evaluating");
});

module.exports = router;
