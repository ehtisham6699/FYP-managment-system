const mongoose = require('mongoose');
// const User = require('./User');
const {UserSchema} = require('./User');
// var Schema = mongoose.Schema;
const PanelSchema = new mongoose.Schema({

  title: {
    type: String,
    
  },
  category: {
    type: String,
    default: "proposal",
    enum: ["proposal", "progress", "final"]
  },

  member: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],

  groups: [{type: mongoose.Schema.Types.ObjectId, ref: 'Group'}]

});

const Panel = mongoose.model('Panel', PanelSchema);

module.exports = Panel;