(function () {
  const util = require('util');
  const baseAction = require('../../commonServices/baseAction');

  function UpdateUserGroup() {
    this.ActionName = 'cmdUpdateGroup';
  }
  util.inherits(UpdateUserGroup, baseAction);

  UpdateUserGroup.prototype.doWork = function (params) {
    return new Promise((resolve, reject) => {
      const dbService = params.dbService;
      const userGroupSchema = params.userGroupSchema;
      const targetGroupId = params.id;
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
