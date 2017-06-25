(function () {
  const util = require('util');
  const baseAction = require('../../commonServices/baseAction');
  const sysConfig = require('../../commonServices/configService');
  function UpdateUserAction(type) {
    this.ActionName = 'cmdUpdateUser';
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
  }
  util.inherits(UpdateUserAction, baseAction);
  UpdateUserAction.prototype.doWork = function (params) {
    return new Promise((resolve, reject) => {
      const dbService = params.dbService;
      const userSchema = params.userSchema;
      const groupSchema = params.userGroupSchema;
      const ObjectId = dbService.Types.ObjectId;
      const targetObjectId = new ObjectId(params.id);

      const payload = params.payload;
      if (payload) {
        const UserModel = dbService.model('Users', userSchema);
        const UserGroupModel = dbService.model('UserGroup', groupSchema);


        if (payload.groupId && payload.entityId) {
          UserGroupModel.find({ groupId: payload.groupId, entityId: payload.entityId },
            (err, docs) => {
              if (err) reject(err);

              if (docs.length > 0) {
                UserModel.findByIdAndUpdate(targetObjectId, { $set: payload }, { new: true },
                  (userError, updatedUser) => {
                    if (userError) return reject(userError);
                    return resolve(updatedUser);
                  });
              } else {
                console.log(payload);
                reject(new Error('Group within the company/bank doesn\'t exists.'));
              }
            });
        } else {
          const newUserData = {
            firstName: payload.firstName,
            lastName: payload.lastName,
          };
          UserModel.findByIdAndUpdate(targetObjectId, { $set: newUserData }, { new: true },
            (userError, updatedUser) => {
              if (userError) return reject(userError);
              return resolve(updatedUser);
            });
        }
      } else {
        throw new Error('Payload Empty');
      }
    });
  };
  module.exports = UpdateUserAction;
}());
