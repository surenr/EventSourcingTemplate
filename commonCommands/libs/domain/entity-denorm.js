const mongoose = require('mongoose');

const EntityDenormSchema = new mongoose.Schema({
  entityId: {
    type: String,
    required: [true, 'NoEntityId'],
  },
  type: {
    type: String,
    required: [true, 'NoType'],
    enum: {
      values: ['Company', 'Bank'],
      message: 'InvalidType',
    },
  },
  name: {
    type: String,
    required: [true, 'NoName'],
  },
  registered_date: {
    type: Date,
    required: [true, 'NoRegistrationDate'],
  },
  registration_number: {
    type: String,
    required: [true, 'NoRegistrationNumber'],
  },
  country: {
    type: String,
    required: [true, 'NoCountry'],
  },
});

module.exports = EntityDenormSchema;