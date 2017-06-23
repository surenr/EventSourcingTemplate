(function () {
  const events = require('events');
  const util = require('util');

  function BaseAction() {
    this.ActionName = '';
    events.EventEmitter.call(this);
  }
  util.inherits(BaseAction, events.EventEmitter);
  BaseAction.prototype.doWork = payload => new Promise((resolve, reject) => {
    if (payload) {
      resolve(payload);
    } else {
      reject('No Payload');
    }
  });

  BaseAction.prototype.perform = function (commandCode, paramContext) {
    try {
      if (this.ActionName !== commandCode) {
        this.emit('reject', commandCode);
      }
      this.doWork(paramContext).then((data) => {
        this.emit('done', data);
      }).catch((error) => { this.emit('error', error); });
    } catch (error) {
      this.emit('error', error);
    }
  };
  module.exports = BaseAction;
}());
