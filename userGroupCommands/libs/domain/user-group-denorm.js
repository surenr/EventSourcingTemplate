const mongoose = require('mongoose');

const UserGroupDenormSchema = new mongoose.Schema({
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
  entityName: {
    type: String,
    required: [true, 'NoEntityName'],
  },
  allowedActions: [String],
});

module.exports = UserGroupDenormSchema;