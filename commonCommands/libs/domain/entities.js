const mongoose = require('mongoose');

const EntitySchema = new mongoose.Schema({
  sequenceId: {
    type: String,
    required: [true, 'NoSequenceId'],
  },
  entityId: {
    type: String,
    required: [true, 'NoEntityId'],
  },
  type: {
    type: String,
    required: [true, 'NoType'],
    enum: ['Company', 'Bank'],
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

module.exports = EntitySchema;