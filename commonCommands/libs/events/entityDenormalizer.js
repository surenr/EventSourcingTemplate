(function () {
  const util = require('util');
  const baseAction = require('../../commonServices/baseAction');
  const sysConfig = require('../../commonServices/configService');
  function EntityDenormalizer(type) {
    // Define which topics should be notified. Add the SNS topic ARNS which need to
    // be notified below.
    this.AnnounceTopicsArray = [];

    this.ActionName = `cmdAddNewEntity${sysConfig.SYSTEM.DENORMALIZER_POSTFIX}`;
    if (!this.ActionNameAliases) this.ActionNameAliases = [];
    this.ActionNameAliases.push(`cmdUpdateEntity${sysConfig.SYSTEM.DENORMALIZER_POSTFIX}`);

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
  util.inherits(EntityDenormalizer, baseAction);

  EntityDenormalizer.prototype.doWork = function (params) {
    return new Promise((resolve, reject) => {
      try {
        const dbService = params.dbService;
        const entityDenormSchema = params.entityDenormSchema;
        const payload = params.payload;
        if (payload) {
          // Check if already exists
          const EntityDenormModel = dbService.model('EntityDenorm', entityDenormSchema);
          EntityDenormModel.findOne({ entityId: payload.entityId }).then((data) => {
            const existingEntity = data;
            if (existingEntity) {
              existingEntity.type = payload.type;
              existingEntity.name = payload.name;
              existingEntity.registered_date = payload.registered_date;
              existingEntity.registration_number = payload.registration_number;
              existingEntity.country = payload.country;
              existingEntity.save((error, updatedDocument) => {
                if (error) reject(error);
                resolve(updatedDocument);
              });
            } else {
              const newEntity = new EntityDenormModel({
                sequenceId: params.sequence,
                entityId: payload.entityId,
                type: payload.type,
                name: payload.name,
                registered_date: payload.registered_date,
                registration_number: payload.registration_number,
                country: payload.country,
              });
              newEntity.save((error, writtenEntity) => {
                if (error) reject(error);
                resolve(writtenEntity);
              });
            }
          }, error => reject(error)).catch(error => reject(error));
        } else {
          throw new Error('Payload Empty');
        }
      } catch (generalErrors) {
        throw generalErrors;
      }
    });
  };
  module.exports = EntityDenormalizer;
}());
