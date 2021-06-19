const mongoose = require("mongoose");
// const User = require('./User');
const { UserSchema } = require("./User");
// var Schema = mongoose.Schema;
const GroupSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  category: {
    type: String,
    default: "mobile",
    enum: ["web", "mobile", "desktop"],
  },
  description: {
    type: String,
  },
  approval: {
    type: String,
    default: "pending",
  },
  batch: {
    type: String,
  },
  member: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  supervisor: { type: String },
  proposal: { type: String },
  progress: { type: String },
  Final: { type: String },
  Batch: { type: Number },
  meetinglogs: [
    {
      meetingname: { type: String },
      date: {
        type: Date,
        default: Date.now("<YYYY-mm-dd>"),
      },
      description: {
        type: String,
      },
      approved: {
        type: String,
        default: "pending",
      },
    },
  ],
  proposalApproved: {
    type: String,
    default: "pending",
  },
  progressApproved: {
    type: String,
    default: "pending",
  },
  finalApproved: {
    type: String,
    default: "pending",
  },
});

const Group = mongoose.model("Group", GroupSchema);

module.exports = Group;
