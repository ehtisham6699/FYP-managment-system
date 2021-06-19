const mongoose = require("mongoose");
const RepositorySchema = new mongoose.Schema({
  title: { type: String },
  category: {
    type: String,
    default: "mobile",
    enum: ["web", "mobile", "desktop"],
  },
  member: [{ type: String }],
  batch: { type: Number },
  report: { type: String },
});

const Repository = mongoose.model("Repository", RepositorySchema);

module.exports = Repository;
