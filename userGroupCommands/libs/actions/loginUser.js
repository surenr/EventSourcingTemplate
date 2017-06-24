(function () {
  const util = require('util');
  const baseAction = require('../../commonServices/baseAction');
  const bcrypt = require('bcrypt');
  const uuidv4 = require('uuid/v4');
  function LoginUserAction() {
    this.ActionName = 'cmdLoginUser';
  }
  util.inherits(LoginUserAction, baseAction);

  function customValidate(userInstance) {
    return new Promise((resolve, reject) => {
      const generalValidationErrors = userInstance.validateSync();
      if (generalValidationErrors) {
        reject(generalValidationErrors);
      }
      resolve();
    });
  }
  LoginUserAction.prototype.doWork = function (params) {
    const dbService = params.dbService;
    const userSchema = params.userSchema;
    const groupSchema = params.userGroupSchema;
    const activeUserSchema = params.activeUserSchema;

    const email = params.email;
    const passwordToMatch = params.password;

    return new Promise((resolve, reject) => {
      if (email && passwordToMatch) {
        const UserModel = dbService.model('Users', userSchema);
        const UserGroupModel = dbService.model('UserGroup', groupSchema);
        const ActiveUserModel = dbService.model('ActiveUsers', activeUserSchema);
        UserModel.findOne({ email }, (error, userDetails) => {
          if (error) reject(error);
          bcrypt.compare(passwordToMatch, userDetails.password).then((isAMatch) => {
            if (!isAMatch) reject(new Error('InvalidCredentials'));
            const generatedOn = new Date();
            const validTill = new Date(generatedOn.getTime() + (30 * 60 * 1000));
            UserGroupModel.findOne({ groupId: userDetails.groupId },
              (userGroupErrors, userGroupDetails) => {
                if (userGroupErrors) reject(userGroupErrors);
                const newActiveUser = new ActiveUserModel({
                  userId: userDetails.userId,
                  groupId: userGroupDetails.groupId,
                  email: userDetails.email,
                  entityId: userGroupDetails.entityId,
                  groupName: userGroupDetails.groupName,
                  firstName: userDetails.firstName,
                  lastName: userDetails.lastName,
                  token: uuidv4(),
                  generatedOn,
                  validTill,
                });

                customValidate(newActiveUser).then(() => {
                  newActiveUser.save((activeUserErrors, activeUser) => {
                    if (activeUserErrors) {
                      reject(activeUserErrors);
                    }
                    resolve(activeUser);
                  });
                }, (activeUserValidationErrors) => {
                  reject(activeUserValidationErrors);
                }).catch((generalErrors) => { reject(generalErrors); });
              });
          });
        });
      } else {
        throw new Error('Email or Password is missing');
      }
    });
  };
  module.exports = LoginUserAction;
}());
