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
        // Call the d
        callback(error, null);
      });
      worker.on('done', (response) => {
        callback(null, response);
      });
      worker.perform(eventActionCommand, getParamContext(eventObject));
    });
  });
};