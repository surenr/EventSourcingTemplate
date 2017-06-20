'use strict';

module.exports.commandHandler = (event, context, callback) => {
  //   const response = {
  //   statusCode: 200,
  //   body: JSON.stringify({
  //     message: 'Welcome to command handler. This will write the required events to dynamodb and trigger the event handler',
  //     input: event,
  //   }),
  // };

  // callback(null, response);
  var AWS = require("aws-sdk");

  AWS.config.update({
    region: "ap-southeast-2",
    // endpoint: "http://localhost:8000"
  });

  var docClient = new AWS.DynamoDB.DocumentClient();

  var table = "event_source";
  let eventDateTime = new Date();
  let eventSequenceId = eventDateTime.getTime();

  let payload = {
    transactionCode: '3d939483',
    FormData: {
      SellerName: 'ABC Company',
      BuyerName: 'XYZ Company'

    }
  }

  var params = {
    TableName: table,
    Item: {
      "sequence": eventSequenceId,
      "issuedOn": eventDateTime.toString(),
      "commandName": 'Save Partial Smart Contract',
      "commandCode": 'CmdSavePartialSmartContract',
      "payload": payload
    }
  };
  console.log(params)
  console.log("Adding a new event...");
  return docClient.put(params, function (err, data) {
    if (err) {
      console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));

    } else {
      console.log("Added item:", JSON.stringify(data, null, 2));
    }
    callback(err, data);
  });
}

module.exports.eventHandler = (event, context, callback) => {
  const AWS = require("aws-sdk");
  console.log('Event Triggered by Dynamodb Stream');
  const eventRecords = event.Records;
  console.log("Event Count: ", eventRecords.length);
  let promiseArray = [];
  let params = {};
  eventRecords.forEach((eventElement) => {
    console.log(eventElement['dynamodb']["NewImage"]["payload"]);
    let snsMessage = JSON.stringify(eventElement['dynamodb']["NewImage"]["payload"]["M"]);
    console.log(eventElement['dynamodb']["NewImage"]["commandCode"]);
    let commandCode = eventElement['dynamodb']["NewImage"]["commandCode"]["S"];
    let snsSubject =  eventElement['dynamodb']["NewImage"]["commandName"]["S"];
    if(!commandCode) throw new Error('Event without command code');
    let snsTopicArn = 'arn:aws:sns:ap-southeast-2:123456789012:'+commandCode;
    // let sns = new AWS.SNS();
    params = {
      "Message": snsMessage,
      "Subject": snsSubject,
      "TopicArn": snsTopicArn
    };
   // promiseArray.push(sns.publish(params).promise());
   console.log(params);
  });
  callback(null,params);
  // Promise.all(promiseArray).then((value)=>{
  //   callback({},value);
  // }).catch(error=>{
  //   callback(error, {});
  // })

};
