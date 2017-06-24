(function () {
  const util = require('util');
  const baseAction = require('../../commonServices/baseAction');

  function AddNewTransactionAction() {
    this.ActionName = 'cmdAddNewTransaction';
  }
  util.inherits(AddNewTransactionAction, baseAction);

  function customValidate(transactionInstance, transactionModel, payload) {
    return new Promise((resolve, reject) => {
      const generalValidationErrors = transactionInstance.validateSync();
      if (generalValidationErrors) {
        reject(generalValidationErrors);
      } else {
        transactionModel.find({ transactionCode: payload.transactionCode },
          (err, docs) => {
            if (err) reject(err);

            if (docs.length > 0) {
              reject(new Error(`Transaction with code "${payload.transactionCode}" Already Exists.`));
            } else {
              resolve();
            }
          });
      }
    });
  }
  AddNewTransactionAction.prototype.doWork = (params) => {
    const dbService = params.dbService;
    const transactionScheme = params.transactionScheme;
    const payload = params.payload;
    return new Promise((resolve, reject) => {
      if (payload) {
        const TransactionModel = dbService.model('Transactions', transactionScheme);

        const newTransaction = new TransactionModel({
          transactionId: payload.transactionId,
          transactionCode: payload.transactionCode,
          transactionName: payload.transactionName,
          buyerEntityId: payload.buyerEntityId,
          sellerEntityId: payload.sellerEntityId,
          advisingBankEntityId: payload.advisingBankEntityId,
          issuingBankEntityId: payload.issuingBankEntityId,
          lastUpdated: payload.lastUpdated,
        });
        customValidate(newTransaction, TransactionModel, payload).then(() => {
          newTransaction.save((error, transaction) => {
            if (error) {
              reject(error);
            }
            resolve(transaction);
          });
        }, (error) => {
          reject(error);
        }).catch((error) => { reject(error); });
      } else {
        throw new Error('Payload Empty');
      }
    });
  };
  module.exports = AddNewTransactionAction;
}());
