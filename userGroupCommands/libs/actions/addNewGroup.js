(function () {
  const util = require('util');
  const baseAction = require('../../commonServices/baseAction');
  const sysConfig = require('../../commonServices/configService');
  function AddNewGroupAction(type) {
    // Define which topics should be notified. Add the SNS topic ARNS which need to
    // be notified below.
    this.AnnounceTopicsArray = [sysConfig.AWS.SNS_DENORMALIZER_ARN];

    this.ActionName = 'cmdAddNewGroup';
    this.ActionType = type || sysConfig.ACTION_TYPES.COMMAND;
    switch (this.ActionType) {
      case sysConfig.ACTION_TYPES.COMMAND:
        this.CONNECTION_STRING = sysConfig.DB.CONNECTION_STRING;
        break;
      case sysConfig.ACTION_TYPES.COMMAND_TEST:
        this.AnnounceTopicsArray = []; // For tests we don't want to announce to the world
        this.CONNECTION_STRING = sysConfig.DB.CONNECTION_STRING_TESTS;
        break;
      default:
        this.CONNECTION_STRING = sysConfig.DB.CONNECTION_STRING;
    }
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
            allowedActions: payload.allowedAction,
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
