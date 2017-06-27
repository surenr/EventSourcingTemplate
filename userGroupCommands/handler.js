const dbService = require('mongoose');
const userSchema = require('./libs/domain/users');
const userGroupSchema = require('./libs/domain/user-group');
const activeUserSchema = require('./libs/domain/loggedInUser');
const sysConfig = require('./commonServices/configService');
const handler = require('./commonServices/eventHandler');
const uuidv4 = require('uuid/v4');


const getParamContext = (eventObj) => {
  switch (eventObj.command) {
    case 'cmdAddNewGroup':
      const groupPayload = eventObj.payload;
      groupPayload.groupId = uuidv4();
      return {
        payload: groupPayload,
        dbService,
        userGroupSchema,
      };
    case 'cmdAddNewUser':
      const userPayload = eventObj.payload;
      userPayload.userid = uuidv4();
      return {
        payload: userPayload,
        dbService,
        userGroupSchema,
        userSchema,
      };
    case 'cmdLoginUser':
      return {
        dbService,
        userSchema,
        userGroupSchema,
        activeUserSchema,
        email: eventObj.payload.email,
        password: eventObj.payload.password,
      };
    case 'cmdUpdateGroup':
      return {
        dbService,
        userGroupSchema,
        id: eventObj.groupId,
        payload: eventObj.payload,
      };
    case 'cmdUpdateUser':
      return {
        dbService,
        userSchema,
        userGroupSchema,
        id: eventObj.userId,
        payload: eventObj.payload,
      };
    default:
      throw new Error('Invalid command code');
  }
};

module.exports.userGroupCommandHandler = (event, context, callback) => {
  // Get All the Action Classes
  const AddNewUserAction = require('./libs/actions/addNewUser');
  const AddNewGroupAction = require('./libs/actions/addNewGroup');
  const UpdateUserAction = require('./libs/actions/updateNewUser');
  const UpdateUserGroup = require('./libs/actions/updateNewGroup');

  const workerInstances = [
    new AddNewUserAction(sysConfig.ACTION_TYPES.COMMAND),
    new AddNewGroupAction(sysConfig.ACTION_TYPES.COMMAND),
    new UpdateUserAction(sysConfig.ACTION_TYPES.COMMAND),
    new UpdateUserGroup(sysConfig.ACTION_TYPES.COMMAND),
    // Add all the worker instance here.
  ];
  handler.commonEventHandler(event, context, workerInstances, getParamContext, callback);
};

