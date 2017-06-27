(function () {
  const util = require('util');
  const baseAction = require('../../commonServices/baseAction');
  const sysConfig = require('../../commonServices/configService');
  function UpdateUserGroup(type) {
    // Define which topics should be notified. Add the SNS topic ARNS which need to
    // be notified below.
    this.AnnounceTopicsArray = [sysConfig.AWS.SNS_DENORMALIZER_ARN];


    this.ActionName = 'cmdUpdateGroup';
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
  util.inherits(UpdateUserGroup, baseAction);

  UpdateUserGroup.prototype.doWork = function (params) {
    return new Promise((resolve, reject) => {
      const dbService = params.dbService;
      const userGroupSchema = params.userGroupSchema;
      const ObjectId = dbService.Types.ObjectId;
      const targetGroupId = new ObjectId(params.id);

      const payload = params.payload;
      if (payload) {
        const UserGroupModel = dbService.model('UserGroups', userGroupSchema);
        UserGroupModel.findByIdAndUpdate(targetGroupId, { $set: params.payload }, { new: true },
          (err, userGroupUpdated) => {
            if (err) return reject(err);
            return resolve(userGroupUpdated);
          });
      } else {
        throw new Error('Payload Empty');
      }
    });
  };
  module.exports = UpdateUserGroup;
}());
