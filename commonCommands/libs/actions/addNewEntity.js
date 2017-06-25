(function () {
  const util = require('util');
  const baseAction = require('../../commonServices/baseAction');
  const sysConfig = require('../../commonServices/configService');
  function AddNewEntity(type) {
    this.ActionName = 'cmdAddNewEntity';
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
  util.inherits(AddNewEntity, baseAction);

  function customValidate(entityInstance, entityModel, payload) {
    return new Promise((resolve, reject) => {
      const generalValidationErrors = entityInstance.validateSync();
      if (generalValidationErrors) {
        reject(generalValidationErrors);
      } else {
        entityModel.find({ entityId: payload.entityId },
          (err, docs) => {
            if (err) reject(err);

            if (docs.length > 0) {
              reject(new Error(`Entity "${payload.name}" Already Exists.`));
            } else {
              resolve();
            }
          });
      }
    });
  }
  AddNewEntity.prototype.doWork = function (params) {
    return new Promise((resolve, reject) => {
      try {
        const dbService = params.dbService;
        const entitySchema = params.entitySchema;
        const payload = params.payload;
        if (payload) {
          const EntityModel = dbService.model('Entity', entitySchema);

          const newEntity = new EntityModel({
            entityId: payload.entityId,
            type: payload.type,
            name: payload.name,
            registered_date: payload.registered_date,
            registration_number: payload.registration_number,
            country: payload.country,
          });
          customValidate(newEntity, EntityModel, payload).then(() => {
            newEntity.save((error, userGroup) => {
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
  module.exports = AddNewEntity;
}());
