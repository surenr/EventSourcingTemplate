'use strict';

module.exports.transactionCommandHandler = (event, context, callback) => {
  console.log('Transaction Command Handler - Event Received')
  console.log(event);
  
  callback(null, 'Transaction Event Handled');
};
