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
router.use(methodOverride("_method"));
var async = require("async");

router.get("/make-groups", (req, res) => {
  //  const userloggedin= User.findById(req.params.id)
  User.find({}).exec(function (err, data) {
    if (err) throw err;
    res.render("student/make-groups", { user: req.user, data: data });
  });
});

//   router.get('/test', (req, res) =>{
// const groups=Group.findById("60741dfdbfb7d53610fcbc84").populate('member').exec(function(err, data) {
//     if (err) throw err;
//     console.log(data);
//   })
//   })

router.get("/groups", ensureAuthenticated, (req, res) => {
  var friends = [];

  // User.find({},function (err, data){
  //   if(err) throw err;
  //   else{
  //    friend=data;
  //   }
  // });

  Group.find()
    .populate("member")
    .exec(function (err, data) {
      if (err) throw err;

      res.render("General/groups", {
        user: req.user,
        data: data,
        // friend=friend
      });
      // console.log(data);
    });
});

router.post("/register", async (req, res) => {
  const member2 = await User.findById(req.body.member2);
  const member = await User.findById(req.body.member);

  const { category, title, description, batch } = req.body;

  const newGroup = new Group({
    title,
    category,
    description,
    batch,
    member: [
      { _id: member._id, name: member.name },
      { _id: member2._id, name: member2.name },
    ],
  });
  if (member) {
    User.findByIdAndUpdate(
      {
        _id: member._id,
      },
      {
        $push: {
          group: {
            groupname: title,
            groupId: newGroup._id,
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
      {
        _id: member2._id,
      },
      {
        $push: {
          group: {
            groupname: title,
            groupId: newGroup._id,
          },
        },
      },
      (err, count) => {
        console.log(err);
      }
    );
  }
  newGroup
    .save()
    .then((post) => {
      res.redirect("/groups/make-groups");
    })
    .catch((err) => console.log(err));
  // }
});

router.get("/search", ensureAuthenticated, function (req, res) {
  var sent = [];
  var friends = [];
  var received = [];
  received = req.user.request;
  sent = req.user.sentRequest;
  friends = req.user.friendsList;

  User.find({ name: { $ne: req.user.name } }, function (err, result) {
    if (err) throw err;

    res.render("student/search", {
      result: result,
      sent: sent,
      friends: friends,
      received: received,
      user: req.user,
    });
  });
});

router.post("/search", ensureAuthenticated, function (req, res) {
  var searchfriend = req.body.searchfriend;
  if (searchfriend) {
    var mssg = "";
    if (searchfriend == req.user.name) {
      searchfriend = null;
    }
    User.find({ name: searchfriend }, function (err, result) {
      if (err) throw err;
      res.render("student/search", {
        result: result,
        mssg: mssg,
      });
    });
  }

  async.parallel(
    [
      function (callback) {
        if (req.body.receiverName) {
          User.update(
            {
              name: req.body.receiverName,
              "request.userId": { $ne: req.user._id },
              "friendsList.friendId": { $ne: req.user._id },
            },
            {
              $push: {
                request: {
                  userId: req.user._id,
                  name: req.user.name,
                },
              },
              $inc: { totalRequest: 1 },
            },
            (err, count) => {
              console.log(err);
              return callback(err, count);
            }
          );
        }
      },
      function (callback) {
        if (req.body.receiverName) {
          User.update(
            {
              name: req.user.name,
              "sentRequest.name": { $ne: req.body.receiverName },
            },
            {
              $push: {
                sentRequest: {
                  name: req.body.receiverName,
                },
              },
            },
            (err, count) => {
              return callback(err, count);
            }
          );
        }
      },
    ],
    (err, results) => {
      res.redirect("/groups/search");
    }
  );

  async.parallel(
    [
      // this function is updated for the receiver of the friend request when it is accepted
      function (callback) {
        var grp = {};

        if (req.body.senderId) {
          User.findById(req.body.senderId).exec(function (e, data) {
            data = data;

            User.update(
              {
                _id: req.user._id,
                "friendsList.friendId": { $ne: req.body.senderId },
              },
              {
                $pull: {
                  request: {
                    userId: req.body.senderId,
                    name: req.body.senderName,
                    //  'userId': req.body.senderId
                  },
                },
                $push: {
                  friendsList: {
                    friendId: data._id,
                    friendName: data.name,
                  },
                },
                $inc: { totalRequest: -1 },
              },
              (err, count) => {
                return callback(err, count);
              }
            );

            Group.findByIdAndUpdate(
              data.group[0].groupId,
              { supervisor: req.user.name },
              function (err, docs) {
                if (err) {
                  console.log(err);
                } else {
                  console.log("Updated User : ");
                }
              }
            );
            User.findByIdAndUpdate(
              req.user._id,
              {
                $push: {
                  group: {
                    groupId: data.group[0].groupId,
                    groupname: data.group[0].groupname,
                  },
                },
              },
              function (err, docs) {
                if (err) {
                  console.log(err);
                } else {
                  console.log("Updated User : ");
                }
              }
            );
          });
        }
      },
      // this function is updated for the sender of the friend request when it is accepted by the receiver
      function (callback) {
        if (req.body.senderId) {
          User.update(
            {
              _id: req.body.senderId,
              "friendsList.friendId": { $ne: req.user._id },
            },
            {
              $push: {
                friendsList: {
                  friendId: req.user._id,
                  friendName: req.user.name,
                },
              },
              $pull: {
                sentRequest: {
                  name: req.user.name,
                },
              },
            },
            (err, count) => {
              return callback(err, count);
            }
          );
        }
      },
      // if user cancels the request then this will work

      //receiver
      function (callback) {
        if (req.body.user_Id) {
          User.update(
            {
              _id: req.user._id,
              "request.userId": { $eq: req.body.user_Id },
            },
            {
              $pull: {
                request: {
                  userId: req.body.user_Id,
                },
              },
              $inc: { totalRequest: -1 },
            },
            (err, count) => {
              return callback(err, count);
            }
          );
        }
      },
      //sender
      function (callback) {
        if (req.body.user_Id) {
          User.update(
            {
              _id: req.body.user_Id,
              "sentRequest.name": { $eq: req.user.name },
            },
            {
              $pull: {
                sentRequest: {
                  name: req.user.name,
                },
              },
            },
            (err, count) => {
              return callback(err, count);
            }
          );
        }
      },
    ],
    (err, results) => {
      res.redirect("groups/search");
    }
  );
});

//for file

router.get("/mygroup", ensureAuthenticated, (req, res) => {
  User.findById(req.user._id).exec(function (err, data) {
    if (err) throw err;
    else {
      data = data;
    }

    Group.findById(data.group[0].groupId).exec(function (err, group) {
      if (err) throw err;
      else {
        group = group;
      }

      res.render("student/mygroup", {
        user: req.user,
        data: data,
        group: group,
      });
    });
  });
});

router.use(upload());

router.post("/", ensureAuthenticated, (req, res) => {
  const { Final, progress, proposal } = req.body;
  if (req.files) {
    var file = req.files.file;
    var filename = file.name;

    console.log(file);
    file.mv("./public/upload/" + filename, function (err) {
      if (err) {
        res.send(err);
      } else {
        User.findById(req.user._id).exec(function (err, data) {
          if (err) throw err;
          else {
            data = data;
          }
          if (proposal) {
            Group.findByIdAndUpdate(
              data.group[0].groupId,
              { proposal: filename },
              function (err, docs) {
                if (err) {
                  console.log(err);
                } else {
                  console.log("Updated User : ");
                }
              }
            );
          } else if (progress) {
            Group.findByIdAndUpdate(
              data.group[0].groupId,
              { progress: filename },
              function (err, docs) {
                if (err) {
                  console.log(err);
                } else {
                  console.log("Updated User : ");
                }
              }
            );
          } else if (Final) {
            Group.findByIdAndUpdate(
              data.group[0].groupId,
              { Final: filename },
              function (err, docs) {
                if (err) {
                  console.log(err);
                } else {
                  console.log("Updated User : ");
                }
              }
            );
          }
        });
        req.flash("success_msg", "Your file  has been uploaded");
        res.redirect("groups/mygroup");
      }
    });
  }
});

router.get("/download/:name", ensureAuthenticated, function (req, res) {
  var name = req.params.name;
  const file = `./public/upload/${name}`;
  res.download(file); // Set disposition and send it.
});

//group supervising
router.get(
  "/groups_supervising",
  ensureAuthenticated,
  authRole("supervisor"),
  (req, res) => {
    var Docs = [];
    User.findById(req.user._id, function (err, data) {
      if (err) throw err;

      data = data;
      async.each(
        data.group,
        function (data, callback) {
          Group.findById(data.groupId, function (err, command) {
            if (command) Docs.push(command);
            callback(err);
          }).populate("member");
        },
        function (err) {
          // code to run on completion or err
          res.render("General/groups_supervising", {
            user: req.user,
            data: data,
            docs: Docs,
          });
        }
      );
    });
  }
);

//meeting log

router.get("/meetinglogs", function (req, res) {
  User.findById(req.user._id, function (err, data) {
    data = data;
    res.render("student/meetinglogs", { user: req.user, data: data });
  });
});

//for adding meeting logs
router.post("/add-meeting", function (req, res) {
  const { meetingname, date, description, approved } = req.body;
  User.findById(req.user._id, function (err, data) {
    data = data;
    Group.updateOne(
      {
        _id: data.group[0].groupId,
      },
      {
        $push: {
          meetinglogs: {
            meetingname: meetingname,
            date: date,
            description: description,
            approved: approved,
          },
        },
      }
    ).exec((err, user) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.redirect("/groups/meetinglogs");
    });
  });
});

//meetings for supervisior
router.get("/meetings/:id", function (req, res) {
  Group.findById(req.params.id).exec((err, data) => {
    if (err) {
      return res.status(500).send(err);
    }
    console.log(data);
    res.render("General/meetings", { user: req.user, data: data });
  });
});

//for changing approval of meeting
router.post("/onclickmeeting", function (req, res) {
  Group.updateOne(
    { _id: req.body.gid, "meetinglogs._id": req.body.logid },
    {
      $set: {
        "meetinglogs.$.approved": "checked",
      },
    }
  ).exec((err, user) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.redirect("meetings/" + req.body.gid);
  });
});

//for group aproval
router.post("/onclickgroupapproval/:id", function (req, res) {
  Group.findByIdAndUpdate(req.params.id, { approval: "approved" }).exec(
    (err, user) => {
      if (err) {
        return res.status(500).send(err);
      }
      console.log(req.params.id);
      res.redirect("/panel/groups_evaluating");
    }
  );
});

//for document checking by admin
router.post("/groups_checked/:id", function (req, res) {
  const proposalA = req.body.proposalA;
  const progressA = req.body.progressA;
  const finalA = req.body.finalA;
  console.log(proposalA);
  Group.findByIdAndUpdate(
    req.params.id,
    {
      proposalApproved: proposalA,
      progressApproved: progressA,
      finalApproved: finalA,
    },
    (err, count) => {
      console.log(err);
    }
  );
  res.redirect("/groups/groups");
});

router.post("/groups_supervising/:id", (req, res) => {
  const meetings = req.body.meetings;
  const cooperation = req.body.cooperation;

  var total = parseInt(meetings) + parseInt(cooperation);

  User.findByIdAndUpdate(
    req.params.id,
    {
      supervisorMarks: {
        meetings: meetings,
        cooperation: cooperation,
        graded: "Graded",
        total: total,
      },
    },
    (err, count) => {
      console.log(err);
    }
  );
  res.redirect("/groups/groups_supervising");
});

//groups supervized removing
router.delete("/groups-supervised-removed/?:id", async (req, res) => {
  const user = await User.findById(req.user._id);
  console.log(req.params.id);
  console.log(req.user._id);
  User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: {
        group: {
          _id: req.params.id,
        },
      },
    },
    (err, count) => {
      console.log(err);
    }
  );
  res.redirect("/groups/groups_supervising");
  // const user = users.find((c) => c.id === parseInt(req.params.id));
});
module.exports = router;
