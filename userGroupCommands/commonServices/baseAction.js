(function () {
  const events = require('events');
  const util = require('util');
  const dbService = require('mongoose');
  const AWS = require('aws-sdk');
  const uuidv4 = require('uuid/v4');
  const sysConfig = require('./configService');

  function BaseAction() {
    this.ActionName = ''; // Unique name identifying the Action Workder
    this.ActionNameAliases = []; // other Action worker names that can trigger this worker.
    this.CONNECTION_STRING = '';
    this.ActionType = '';
    this.AnnounceTopicsArray = [sysConfig.AWS.SNS_DENORMALIZER_ARN];
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

  BaseAction.prototype.announceDone = results => new Promise((resolve, reject) => {
    const promiseArray = [];
    if (this.AnnounceTopicsArray) {
      this.AnnounceTopicsArray.forEach((topic) => {
        const snsMessageObject = {
          id: uuidv4(),
          command: `${this.ActionName}${sysConfig.SYSTEM.DENORMALIZER_POSTFIX}`,
          payload: results,
        };
        const snsMessage = JSON.stringify(snsMessageObject);
        const snsTopicArn = topic;
        const sns = new AWS.SNS();
        const params = {
          Message: snsMessage,
          Subject: `${this.ActionName} Completed`,
          TopicArn: snsTopicArn,
        };
        promiseArray.push(sns.publish(params).promise());
      });
    }
    Promise.all(promiseArray).then(data => resolve(data), error => reject(error))
      .catch(error => reject(error));
  });

  BaseAction.prototype.isThisAction = function (commandCode) {
    if (this.ActionName === commandCode) return true;
    if (this.ActionNameAliases && this.ActionNameAliases.length > 0) {
      for (let i = 0; i < this.ActionNameAliases.length; i++) {
        if (this.ActionNameAliases[i] === commandCode) return true;
      }
      return false;
    }
    return false;
  };

  BaseAction.prototype.perform = function (commandCode, paramContext) {
    try {
      if (!this.isThisAction(commandCode)) {
        this.emit('reject', commandCode);
      } else {
        dbService.connect(this.CONNECTION_STRING);
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
