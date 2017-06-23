const mongoose = require('mongoose');

const UserGroupSchema = new mongoose.Schema({
  _id: mongoose.SchemaTypes.ObjectId,
  groupId: String,
  groupName: String,
  entityId: String,
  allowedActions: [String],
  allowedRoutes: [String],
});

module.exports = mongoose.model('UserGroup', UserGroupSchema); 