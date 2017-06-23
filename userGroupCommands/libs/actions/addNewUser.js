(function () {
  const util = require('util');
  const baseAction = require('../../commonServices/baseAction');
  const bcrypt = require('bcrypt');

  function AddNewUserAction() {
    this.ActionName = 'cmdAddNewUser';
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
    const dbService = params.dbService;
    const userSchema = params.userSchema;
    const groupSchema = params.userGroupSchema;
    const payload = params.payload;
    return new Promise((resolve, reject) => {
      if (payload) {
        const UserModel = dbService.model('Users', userSchema);
        const UserGroupModel = dbService.model('UserGroup', groupSchema);
        bcrypt.hash(payload.password, 10).then((passwordHash) => {
          const newUser = new UserModel({
            userId: payload.userId,
            groupId: payload.groupId,
            email: payload.email,
            entityId: payload.entityId,
            firstName: payload.firstName,
            lastName: payload.lastName,
            password: passwordHash,
          });
          return customValidate(newUser, UserGroupModel, payload);
        }).then((newUser) => {
          newUser.save((error, newUserObj) => {
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
