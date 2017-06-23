const mongoose = require('mongoose');
const validator = require('validator');

const UserSchema = new mongoose.Schema({
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
  firstName: {
    type: String,
    required: [true, 'NoFirstName'],
    minlength: [3, 'FirstNameTooShort'],
    maxlength: [20, 'FirstNameTooLong'],
  },
  lastName: {
    type: String,
    required: [true, 'NoLastName'],
    minlength: [3, 'FirstNameTooShort'],
    maxlength: [20, 'FirstNameTooLong'],
  },
  password: {
    type: String,
    required: [true, 'NoPassword'],
  },
});

module.exports = UserSchema;