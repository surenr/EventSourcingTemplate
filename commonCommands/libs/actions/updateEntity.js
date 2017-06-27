(function () {
  const util = require('util');
  const baseAction = require('../../commonServices/baseAction');
  const sysConfig = require('../../commonServices/configService');
  function UpdateEntity(type) {
    // Define which topics should be notified. Add the SNS topic ARNS which need to
    // be notified below.
    this.AnnounceTopicsArray = [sysConfig.AWS.SNS_DENORMALIZER_ARN];

    this.ActionName = 'cmdUpdateEntity';
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
  util.inherits(UpdateEntity, baseAction);

  UpdateEntity.prototype.doWork = function (params) {
    return new Promise((resolve, reject) => {
      try {
        const dbService = params.dbService;
        const ObjectId = dbService.Types.ObjectId;
        const targetEntityId = new ObjectId(params.id);
        const entitySchema = params.entitySchema;
        const payload = params.payload;
        if (payload) {
          const EntityModel = dbService.model('Entity', entitySchema);
          EntityModel.findByIdAndUpdate(targetEntityId, { $set: payload }, { new: true },
            (err, entityUpdated) => {
              if (err) return reject(err);
              return resolve(entityUpdated);
            });
        } else {
          throw new Error('Payload Empty');
        }
      } catch (generalErrors) {
        throw generalErrors;
      }
    });
  };
  module.exports = UpdateEntity;
}());
