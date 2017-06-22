const AWS = require('aws-sdk');

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
  callback(null, 'Event Fired');
};
