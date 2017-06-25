const mongoose = require('mongoose');

const EntitySchema = new mongoose.Schema({
  entityId: {
    type: String,
    required: [true, 'NoEntityId'],
  },
  type: {
    type: String,
    required: [true, 'NoType'],
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