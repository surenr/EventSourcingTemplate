const mongoose = require('mongoose');

const ErrorSchema = new mongoose.Schema({
  sequenceId: {
    type: String,
    required: [true, 'NoSequenceId'],
  },
  errorCode: {
    type: String,
    required: [true, 'NoErrorCode'],
  },
  message: {
    type: String,
    required: [true, 'NoErrorMessage'],
  },
  fullError: {
    type: String,
    required: [true, 'NoFullError'],
  },
  reported_date: {
    type: Date,
    required: [true, 'NoReportedDate'],
  },
});

module.exports = ErrorSchema;