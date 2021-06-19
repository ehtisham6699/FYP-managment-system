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
const Repository = require("../models/Repository");
router.use(methodOverride("_method"));
var async = require("async");

//repository
router.get("/repository", ensureAuthenticated, (req, res) => {
  Repository.find().exec((err, data) => {
    if (err) {
      return res.status(500).send(err);
    } else {
      res.render("General/repository", { user: req.user, data: data });
    }
  });
});

//adding new  past porject
router.post("/add-group/:id", ensureAuthenticated, (req, res) => {
  var m = [];
  Group.findById(req.params.id)
    .populate("member")
    .exec((err, data) => {
      if (err) {
        return res.status(500).send(err);
      }

      async.each(
        data.member,
        function (command, callback) {
          if (command) m.push(command.name);
          callback(err);
        },
        function (err) {
          // code to run on completion or err
          const newRepository = new Repository({
            title: data.title,
            category: data.category,
            batch: data.batch,
            member: [...m],
            report: data.Final,
          });
          newRepository.save(function (err, result) {
            if (err) {
              console.log(err);
            } else {
              res.redirect("/groups/groups");
            }
          });
        }
      );
    });
});

router.get("/groups_evaluating", ensureAuthenticated, (req, res) => {
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
          panel: Docs,
        });
      }
    );
  });
});
module.exports = router;
