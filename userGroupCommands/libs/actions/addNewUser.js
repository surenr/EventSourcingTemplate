(function () {
  const util = require('util');
  const baseAction = require('../../commonServices/baseAction');
  const md5 = require('md5');
  const sysConfig = require('../../commonServices/configService');
  function AddNewUserAction(type) {
    this.ActionName = 'cmdAddNewUser';
    this.ActionType = type || sysConfig.ACTION_TYPES.COMMAND;
    switch (this.ActionType) {
      case sysConfig.ACTION_TYPES.COMMAND:
        this.CONNECTION_STRING = sysConfig.DB.CONNECTION_STRING;
        break;
      case sysConfig.ACTION_TYPES.COMMAND_TEST:
        this.CONNECTION_STRING = sysConfig.DB.CONNECTION_STRING_TESTS;
        break;
      default:
        this.CONNECTION_STRING = sysConfig.DB.CONNECTION_STRING;
    }
    console.log(this.CONNECTION_STRING);
  }
  util.inherits(AddNewUserAction, baseAction);

  function customValidate(userInstance, groupModel, payload) {
    return new Promise((resolve, reject) => {
      const generalValidationErrors = userInstance.validateSync();
      if (generalValidationErrors) {
        reject(generalValidationErrors);
      } else {
        groupModel.find({ groupId: payload.groupId, entityId: payload.entityId },
          (err, docs) => {
            if (err) reject(err);

            if (docs.length > 0) {
              resolve(userInstance);
            } else {
              console.log(payload);
              reject(new Error('Group within the company/bank doesn\'t exists.'));
            }
          });
      }
    });
  }
  AddNewUserAction.prototype.doWork = function (params) {
    return new Promise((resolve, reject) => {
      const dbService = params.dbService;
      const userSchema = params.userSchema;
      const groupSchema = params.userGroupSchema;
      const payload = params.payload;
      if (payload) {
        const UserModel = dbService.model('Users', userSchema);
        const UserGroupModel = dbService.model('UserGroup', groupSchema);

        const newUser = new UserModel({
          userId: payload.userId,
          groupId: payload.groupId,
          email: payload.email,
          entityId: payload.entityId,
          firstName: payload.firstName,
          lastName: payload.lastName,
          password: md5(payload.password),
        });
        customValidate(newUser, UserGroupModel, payload).then((validatedInstance) => {
          validatedInstance.save((error, newUserObj) => {
            if (error) {
              reject(error);
            }
            resolve(newUserObj);
          });
        }, (error) => {
          reject(error);
        }).catch((error) => { reject(error); });
      } else {
        throw new Error('Payload Empty');
      }
    });
  };
  module.exports = AddNewUserAction;
}());
