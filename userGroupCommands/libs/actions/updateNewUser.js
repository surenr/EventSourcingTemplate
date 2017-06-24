(function () {
  const util = require('util');
  const baseAction = require('../../commonServices/baseAction');

  function UpdateUserAction() {
    this.ActionName = 'cmdUpdateUser';
  }
  util.inherits(UpdateUserAction, baseAction);
  UpdateUserAction.prototype.doWork = function (params) {
    return new Promise((resolve, reject) => {
      const dbService = params.dbService;
      const userSchema = params.userSchema;
      const groupSchema = params.userGroupSchema;
      const targetObjectId = params.id;
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
