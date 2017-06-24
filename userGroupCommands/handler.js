
const dbService = require('mongoose');
const uuidv4 = require('uuid/v4');
const util = require('util');
const userSchema = require('./libs/domain/users');
const userGroupSchema = require('./libs/domain/user-group');
const activeUserSchema = require('./libs/domain/loggedInUser');
const sysConfig = require('./commonServices/configService');

const getParamContext = (eventObj) => {
  switch (eventObj.command) {
    case 'cmdAddNewGroup':
      return {
        payload: eventObj.payload,
        dbService,
        userGroupSchema,
      };
    case 'cmdAddNewUser':
      return {
        payload: eventObj.payload,
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
      throw new Error('Invalid command comde');
  }
};

module.exports.userGroupCommandHandler = (event, context, callback) => {
  // Get All the Action Classes
  const AddNewUserAction = require('./libs/actions/addNewUser');
  const AddNewGroupAction = require('./libs/actions/addNewGroup');
  const UpdateUserAction = require('./libs/actions/updateNewUser');
  const UpdateUserGroup = require('./libs/actions/updateNewGroup');

  const workerInstances = [
    new AddNewUserAction(),
    new AddNewGroupAction(),
    new UpdateUserAction(),
    new UpdateUserGroup(),
    // Add all the worker instance here.
  ];
  const eventRecords = event.Records;
  eventRecords.forEach((eventElement) => {
    const eventObject = JSON.parse(eventElement.Sns.Message);
    const eventActionCommand = eventObject.command;
    if (!eventActionCommand) callback(new Error('Event Command Not Found.'), null);
    workerInstances.map((worker) => {
      dbService.connect(sysConfig.DB.CONNECTION_STRING);
      const db = dbService.connection;
      db.on('error', () => {
        throw new Error('Connection Error');
      });
      
      db.once('open', () => {
        worker.on('reject', (commandCode) => {
          db.close((error) => {
            if (error) throw error;
            console.log(`Worker rejected the command code ${commandCode}`);
          });
        });

        worker.on('error', (error) => {
          db.close((dbCloseError) => {
            if (dbCloseError) throw dbCloseError;
            callback(error, null);
          });
        });

        worker.on('done', (response) => {
          db.close((dbCloseError) => {
            if (dbCloseError) throw dbCloseError;
            callback(null, response);
          });
        });

        const paramContext = getParamContext(eventObject);
        worker.perform(eventActionCommand, paramContext);
      });
    });
  });
};
