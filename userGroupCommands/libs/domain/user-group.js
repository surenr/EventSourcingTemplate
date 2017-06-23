const mongoose = require('mongoose');

const UserGroupSchema = new mongoose.Schema({
  groupId: {
    type: String,
    required: [true, 'NoGroupId'],
  },
  groupName: {
    type: String,
    required: [true, 'NoGroupName'],
  },
  entityId: {
    type: String,
    required: [true, 'NoEntityId'],
  },
  allowedActions: [String],
});

module.exports = UserGroupSchema;