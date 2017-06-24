(function () {
  const util = require('util');
  const baseAction = require('../../commonServices/baseAction');

  function AddNewGroupAction() {
    this.ActionName = 'cmdAddNewGroup';
  }
  util.inherits(AddNewGroupAction, baseAction);

  function customValidate(userGroupInstance, userGroupModel, payload) {
    return new Promise((resolve, reject) => {
      const generalValidationErrors = userGroupInstance.validateSync();
      if (generalValidationErrors) {
        reject(generalValidationErrors);
      } else {
        userGroupModel.find({ entityId: payload.entityId, groupName: payload.groupName },
          (err, docs) => {
            if (err) reject(err);

            if (docs.length > 0) {
              reject(new Error(`Group "${payload.groupName}" Already Exists.`));
            } else {
              resolve();
            }
          });
      }
    });
  }
  AddNewGroupAction.prototype.doWork = function (params) {
    return new Promise((resolve, reject) => {
      try {
        const dbService = params.dbService;
        const userGroupSchema = params.userGroupSchema;
        const payload = params.payload;
        if (payload) {
          const UserGroupModel = dbService.model('UserGroups', userGroupSchema);

          const newUserGroup = new UserGroupModel({
            groupId: payload.groupId,
            groupName: payload.groupName,
            entityId: payload.entityId,
            allowedActions: payload.allowedActions,
          });
          customValidate(newUserGroup, UserGroupModel, payload).then(() => {
            newUserGroup.save((error, userGroup) => {
              if (error) {
                reject(error);
              }
              resolve(userGroup);
            });
          }, (error) => {
            reject(error);
          }).catch((error) => { reject(error); });
        } else {
          throw new Error('Payload Empty');
        }
      } catch (generalErrors) {
        throw generalErrors;
      }
    });
  };
  module.exports = AddNewGroupAction;
}());
