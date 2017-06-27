(function () {
  const util = require('util');
  const baseAction = require('../../commonServices/baseAction');
  const sysConfig = require('../../commonServices/configService');
  function UserGroupDenormalizer(type) {
    // Define which topics should be notified. Add the SNS topic ARNS which need to
    // be notified below.
    this.AnnounceTopicsArray = [sysConfig.AWS.SNS_DENORMALIZER_ARN];


    this.ActionName = 'eventUserGroupUpdated';
    this.ActionType = type || sysConfig.ACTION_TYPES.QUERY;
    switch (this.ActionType) {
      case sysConfig.ACTION_TYPES.QUERY:
        this.CONNECTION_STRING = sysConfig.DB.CONNECTION_STRING_QUERY;
        break;
      case sysConfig.ACTION_TYPES.QUERY_TEST:
        this.CONNECTION_STRING = sysConfig.DB.CONNECTION_STRING_TESTS_QUERY;
        break;
      default:
        this.CONNECTION_STRING = sysConfig.DB.CONNECTION_STRING_QUERY;
    }
  }
  util.inherits(UserGroupDenormalizer, baseAction);
  UserGroupDenormalizer.prototype.doWork = function (params) {
    return new Promise((resolve, reject) => {
      try {
        const dbService = params.dbService;
        const userGroupSchema = params.userGroupSchema;
        const payload = params.payload;
        if (payload) {
          resolve();
        } else {
          throw new Error('Payload Empty');
        }
      } catch (generalErrors) {
        throw generalErrors;
      }
    });
  };
  module.exports = UserGroupDenormalizer;
}());
