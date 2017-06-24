const AWS = require('aws-sdk');
const sysConfig = require('./commonServices/configService');

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

    const params = {
      TableName: table,
      Item: {
        sequence: eventSequenceId,
        issuedOn: eventDateTime.toString(),
        commandName: eventData.commandName,
        commandCode: eventData.commandCode,
        payload: eventData.payload,
      },
    };

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
  let params = {};
  eventRecords.forEach((eventElement) => {
    console.log(eventElement.dynamodb.NewImage.payload);

    console.log(eventElement.dynamodb.NewImage.commandCode);
    const commandCode = eventElement.dynamodb.NewImage.commandCode.S;
    const snsSubject = eventElement.dynamodb.NewImage.commandName.S;
    if (!commandCode) throw new Error('Event without command code');
    const snsTopicName = sysConfig.COMMAND_TOPIC_MAP[commandCode];
    if (!snsTopicName) throw new Error(`No Handler found for command ${commandCode}`);
    const snsMessageObject = {
      command: commandCode,
      payload: eventElement.dynamodb.NewImage.payload.M,
    };
    const snsMessage = JSON.stringify(snsMessageObject);

    const snsTopicArn = `${sysConfig.AWS.SNS_BASE_ARN}${snsTopicName}`;
    const sns = new AWS.SNS();
    params = {
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
