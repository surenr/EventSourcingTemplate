(function () {
  const util = require('util');
  const baseAction = require('../../commonServices/baseAction');

  function AddNewGroupAction() {
    this.ActionName = 'cmdAddNewGroup';
  }
  util.inherits(AddNewGroupAction, baseAction);
  AddNewGroupAction.prototype.doWork = function (params) {
    return new Promise((resolve, reject) => {
      if (params.payload) {
        resolve(params.payload);
      } else {
        throw new Error('Payload Empty');
      }
    });
  };
  module.exports = AddNewGroupAction;
}());
