const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: [true, 'NoTransactionId'],
  },
  transactionCode: {
    type: String,
    required: [true, 'NoTransactionCode'],
  },
  transactionName: {
    type: String,
    required: [true, 'NoTransactionName'],
  },
  buyerEntityId: {
    type: String,
    required: [true, 'NoBuyerEntity'],
  },
  sellerEntityId: {
    type: String,
    required: [true, 'NoSellerEntity'],
  },
  advisingBankEntityId: {
    type: String,
    required: [true, 'NoAdvisingBankEntity'],
  },
  issuingBankEntityId: {
    type: String,
    required: [true, 'NoIssuingBankEntity'],
  },
  lastUpdated: {
    type: Date,
    required: [true, 'NoLastUpdatedDate'],
  },
});

module.exports = TransactionSchema;