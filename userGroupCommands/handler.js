module.exports.userGroupCommandHandler = (event, context, action, callback) => {
  // const addNewGroupAction = require('./libs/actions/addNewGroup');
  console.log('Event Object');
  console.log(event.payload);

  action.perform(event.payload);
  callback(null, 'success');
  // console.log('User Group Command Handler - Event Received')
  // console.log(event);

  // callback(null, 'User Group Event Handled');

  // // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!'
  // , event });
};
