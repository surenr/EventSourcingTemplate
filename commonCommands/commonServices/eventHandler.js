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
        console.log('worker succeeded. Need to inform the De-normalizer');
        console.log(response);
        console.log('Get the worker to announce the world the work is done');
        worker.announceDone(response).then((announcedData) => {
          callback(null, announcedData);
        }, error => callback(error, null)).catch(error => callback(error, null));
      });
      worker.perform(eventActionCommand, getParamContext(eventObject));
    });
  });
};