const sysConfig = require('./configService');
module.exports.commonEventHandler = (event, context, workerArray, getParamContext, callback) => {
  const eventRecords = event.Records;
  eventRecords.forEach((eventElement) => {
    const eventObject = JSON.parse(eventElement.Sns.Message);
    console.log(eventObject);
    const eventActionCommand = eventObject.command;
    if (!eventActionCommand) callback(new Error('Event Command Not Found.'), null);
    workerArray.map((worker) => {
      worker.on('reject', commandCode => console.log(`Worker rejected the command code ${commandCode}`));
      worker.on('error', (error) => {
        console.log('worker reported errors');
        // log the error
        console.log(error);
        worker.announceFail(error, getParamContext(eventObject), worker)
          .then((announceResponse) => {
            console.log(announceResponse);
            // For Errors that are Successfully recorded we are removing the message from queue.
            callback(null, error);
          }, (messageError) => {
            console.log('Message Error: ', messageError);
            console.log('App Error: ', error);
            callback(messageError, null);
          }).catch((messageError) => {
            console.log('Message Error: ', messageError);
            console.log('App Error: ', error);
            callback(messageError, null);
          });
      });
      worker.on('done', (response) => {
        console.log(worker.ActionType);
        worker.announceDone(response, getParamContext(eventObject), worker)
          .then((announcedData) => {
            console.log(announcedData);
            callback(null, response);
          }, (error) => {
            console.log(error);
            callback(error, null);
          }).catch((error) => {
            console.log(error);
            callback(error, null);
          });
      });
      worker.perform(eventActionCommand, getParamContext(eventObject));
    });
  });
};