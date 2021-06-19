const mongoose = require("mongoose");
const { GroupSchema } = require("./Group");
const UserSchema = new mongoose.Schema({
  rollno: {
    type: Number,
    default: "",
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  available: { type: String, default: "Available" },
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin", "supervisor", "student"],
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  sentRequest: [
    {
      name: { type: String, default: "" },
    },
  ],
  request: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: { type: String, default: "" },
    },
  ],
  friendsList: [
    {
      friendId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      friendName: { type: String, default: "" },
    },
  ],
  totalRequest: { type: Number, default: 0 },
  group: [
    {
      groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
      groupname: { type: String, default: "" },
    },
  ],
  Panel: [
    {
      panelId: { type: mongoose.Schema.Types.ObjectId, ref: "Panel" },
      panelname: { type: String },
      category: { type: String },
    },
  ],
  proposalMarks: {
    dressing: { type: Number },
    presentation: { type: Number },
    report: { type: Number },
    graded: { type: String, default: "Not Graded" },
    total: { type: Number },
  },
  progressMarks: {
    dressing: { type: Number },
    presentation: { type: Number },
    report: { type: Number },
    progress: { type: Number },
    graded: { type: String, default: "not Graded" },
    total: { type: Number },
  },
  finalMarks: {
    dressing: { type: Number },
    presentation: { type: Number },
    report: { type: Number },
    project: { type: Number },
    graded: { type: String, default: "not Graded" },
    total: { type: Number },
  },
  supervisorMarks: {
    meetings: { type: Number },
    cooperation: { type: Number },
    graded: { type: String, default: "not Graded" },
    total: { type: Number },
  },
  totalMarks: { type: Number },
  Grade: { type: String },
});

const User = mongoose.model("User", UserSchema);
exports.UserSchema = UserSchema;

module.exports.getUserByUsername = function (name, callback) {
  var query = { name: name };
  User.findOne(query, callback);
};

module.exports.getUserById = function (id, callback) {
  User.findById(id, callback);
};
module.exports = User;
