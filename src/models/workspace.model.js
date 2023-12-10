const mongoose = require('mongoose');

const WorkspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  user_id: {
    type: String,
    required: true,
  },
  nodes: {
    type: Array,
  },
  viewport: {
    type: Array,
  }
});

const Workspace = mongoose.model('Workspace', WorkspaceSchema);

module.exports = Workspace;
