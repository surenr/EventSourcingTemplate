const AWS = require('aws-sdk');
const dbService = require('mongoose');
const uuidv4 = require('uuid/v4');
const handler = require('./commonServices/eventHandler');
const omitEmpty = require('omit-empty');
const parse = AWS.DynamoDB.Converter.output;
const sysConfig = require('./commonServices/configService');
const entitySchema = require('./libs/domain/entities.js');

const getParamContext = (eventObj) => {
  switch (eventObj.command) {
    case 'cmdAddNewEntity':
      const payload = eventObj.payload;
      payload.entityId = uuidv4();
      return {
        payload,
        dbService,
        entitySchema,
      };
    case 'cmdUpdateEntity':
      return {
        id: eventObj.id,
        dbService,
        entitySchema,
        payload: eventObj.payload,
      };
    default:
      throw new Error('Invalid command code');
  }
};

module.exports.entityCommandHandler = (event, context, callback) => {
  const AddNewEntity = require('./libs/actions/addNewEntity');
  const UpdateEntity = require('./libs/actions/updateEntity');

  const workerInstances = [
    new AddNewEntity(sysConfig.ACTION_TYPES.COMMAND),
    new UpdateEntity(sysConfig.ACTION_TYPES.COMMAND),
  ];
  handler.commonEventHandler(event, context, workerInstances, getParamContext, callback);
};

module.exports.commandHandler = (event, context, callback) => {
  if (event.path === '/tradeit/command') {
    const eventData = JSON.parse(event.body);
    let response = {};
    if (!eventData.commandName || !eventData.commandCode) {
      response = {
        statusCode: 500,
        body: 'Un-identified command, no commandName or commandCode found in the request.',
      };
    }
    AWS.config.update({
      region: 'ap-southeast-2',
    });

    const docClient = new AWS.DynamoDB.DocumentClient();

    const table = 'event-source';
    const eventDateTime = new Date();
    const eventSequenceId = eventDateTime.getTime();

    let params = {
      TableName: table,
      Item: {
        sequence: eventSequenceId,
        issuedOn: eventDateTime.toString(),
        commandName: eventData.commandName ? eventData.commandName : '',
        commandCode: eventData.commandCode ? eventData.commandCode : '',
        id: eventData.id ? eventData.id : '',
        payload: eventData.payload,
      },
    };

    params = omitEmpty(params);

    return docClient.put(params, (error) => {
      if (error) {
        response = {
          statusCode: 500,
          body: JSON.stringify(error),
        };
      } else {
        response = {
          statusCode: 200,
          body: JSON.stringify({ sequenceId: eventSequenceId }),
        };
      }
      callback(null, response);
    });
  }
  return callback(new Error('Invalid Command API Call'), null);
};

module.exports.eventHandler = (event, context, callback) => {
  console.log(event);

  const eventRecords = event.Records;
  console.log('Event Count: ', eventRecords.length);
  const promiseArray = [];

  eventRecords.forEach((eventElement) => {
    const dynamoDbJsonEvent = parse({ M: eventElement.dynamodb.NewImage });
    console.log(dynamoDbJsonEvent);
    console.log(dynamoDbJsonEvent.payload);
    console.log(dynamoDbJsonEvent.commandCode);
    const commandCode = dynamoDbJsonEvent.commandCode ? dynamoDbJsonEvent.commandCode : '';
    const snsSubject = dynamoDbJsonEvent.commandName ? dynamoDbJsonEvent.commandName : '';
    const id = dynamoDbJsonEvent.id ? dynamoDbJsonEvent.id : '';
    if (!commandCode) throw new Error('Event without command code');
    const snsTopicName = sysConfig.COMMAND_TOPIC_MAP[commandCode];
    if (!snsTopicName) throw new Error(`No Handler found for command ${commandCode}`);
    const snsMessageObject = {
      id,
      command: commandCode,
      payload: dynamoDbJsonEvent.payload,
    };
    const snsMessage = JSON.stringify(snsMessageObject);

    const snsTopicArn = `${sysConfig.AWS.SNS_BASE_ARN}${snsTopicName}`;
    const sns = new AWS.SNS();
    const params = {
      Message: snsMessage,
      Subject: snsSubject,
      TopicArn: snsTopicArn,
    };
    promiseArray.push(sns.publish(params).promise());
    console.log(params);
  });

  Promise.all(promiseArray).then((data) => {
    callback(null, data);
  }, (error) => {
    callback(error, null);
  }).catch(error => callback(error, null));
};
