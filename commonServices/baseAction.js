(function () {
  const events = require('events');
  const util = require('util');
  const dbService = require('mongoose');
  const sysConfig = require('./configService');

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
      } else {
        dbService.connect(sysConfig.DB.CONNECTION_STRING);
        const db = dbService.connection;
        db.on('error', () => {
          throw new Error('Connection Error');
        });

        db.once('open', () => {
          this.doWork(paramContext).then((data) => {
            db.close((dbError) => {
              if (dbError) this.emit('error', dbError);
              this.emit('done', data);
            });
          }, (error) => {
            db.close((dbError) => {
              if (dbError) this.emit('error', dbError);
              this.emit('error', error);
            });
          }).catch((error) => {
            db.close((dbError) => {
              if (dbError) this.emit('error', dbError);
              this.emit('error', error);
            });
          });
        });
      }
    } catch (error) {
      console.log(error);
      this.emit('error', error);
    }
  };
  module.exports = BaseAction;
}());
