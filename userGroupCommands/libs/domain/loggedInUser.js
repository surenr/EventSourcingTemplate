const mongoose = require('mongoose');
const validator = require('validator');

const ActiveUserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'NoUserId'],
  },
  groupId: {
    type: String,
    required: [true, 'NoGroupId'],
  },
  email: {
    type: String,
    unique: true,
    validate: {
      validator(v) {
        return validator.isEmail(v);
      },
      message: 'InvalidEmail',
    },
    required: [true, 'NoEmail'],
  },
  entityId: {
    type: String,
    required: [true, 'NoEntityId'],
  },
  groupName: {
    type: String,
    required: [true, 'NoGroupName'],
  },
  firstName: {
    type: String,
    required: [true, 'NoFirstName'],
  },
  lastName: {
    type: String,
    required: [true, 'NoLastName'],
  },
  token: {
    type: String,
    required: [true, 'NoToken'],
  },
  generatedOn: {
    type: Date,
    required: [true, 'NoTokenCreatedDate'],
  },
  validTill: {
    type: Date,
    required: [true, 'NoExpirationDate'],
  },
});

module.exports = ActiveUserSchema;