'use strict';

module.exports.commandHandler = (event, context, callback) => {
  if (event.path === '/tradeit/command') {
    const AWS = require("aws-sdk");
    const eventData = JSON.parse(event.body);
    let response = {};
    if (!eventData.commandName || !eventData.commandCode) {
       response = {
          statusCode: 500,
          body: "Un-identified command, no commandName or commandCode found in the request.",
        };
    }
    AWS.config.update({
      region: "ap-southeast-2"
    });

    let docClient = new AWS.DynamoDB.DocumentClient();

    let table = "event_source";
    let eventDateTime = new Date();
    let eventSequenceId = eventDateTime.getTime();

    let params = {
      TableName: table,
      Item: {
        "sequence": eventSequenceId,
        "issuedOn": eventDateTime.toString(),
        "commandName": eventData.commandName,
        "commandCode": eventData.commandCode,
        "payload": eventData.payload
      }
    };
    console.log(params)
    console.log("Adding a new event...");
    return docClient.put(params, function (error, data) {

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
  callback(new Error('Invalid Command API Call'), null);

};
