(function () {
  const util = require('util');
  const baseAction = require('../../commonServices/baseAction');
  const sysConfig = require('../../commonServices/configService');
  function ErrorDenormalizer(type) {
    // Define which topics should be notified. Add the SNS topic ARNS which need to
    // be notified below.
    this.AnnounceTopicsArray = [];
    this.ActionName = 'cmdError';
    if (!this.ActionNameAliases) this.ActionNameAliases = [];
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
  util.inherits(ErrorDenormalizer, baseAction);

  ErrorDenormalizer.prototype.doWork = function (params) {
    return new Promise((resolve, reject) => {
      try {
        const dbService = params.dbService;
        const errorSchema = params.errorSchema;
        const payload = params.payload;
        if (payload) {
          // Check if already exists
          const ErrorDenormModel = dbService.model('Errors', errorSchema);
          ErrorDenormModel.findOne({ sequenceId: params.sequence }).then((data) => {
            const existingError = data;
            if (existingError) {
              existingError.errorCode = payload.errorCode;
              existingError.message = payload.message;
              existingError.reported_date = payload.reported_date;
              existingError.fullError = payload.fullError;
              existingError.save((error, updatedDocument) => {
                if (error) reject(error);
                resolve(updatedDocument);
              });
            } else {
              const newError = new ErrorDenormModel({
                sequenceId: params.sequence,
                errorCode: payload.errorCode,
                message: payload.message,
                reported_date: payload.reported_date,
                fullError: payload.fullError,
              });
              newError.save((error, writtenError) => {
                if (error) reject(error);
                resolve(writtenError);
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
  module.exports = ErrorDenormalizer;
}());
