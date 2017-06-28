module.exports = {
  SYSTEM: {
    DENORMALIZER_POSTFIX: 'Completed',
  },

  AWS: {
    SNS_BASE_ARN: 'arn:aws:sns:ap-southeast-2:296927073230:GeneralCommandSNSTopic',
    SNS_DENORMALIZER_ARN: 'arn:aws:sns:ap-southeast-2:296927073230:DeNormalizerSNSTopic',
    SNS_ERROR_ARN: 'arn:aws:sns:ap-southeast-2:296927073230:ErrorMessageSNSTopic',
  },
  DB: {
    CONNECTION_STRING: 'mongodb://usrtradeitdb:tradeituserPa$$wd@SG-TradeIT-10478.servers.mongodirector.com:27017/tradeit',
    CONNECTION_STRING_QUERY: 'mongodb://usrtradeitdb:tradeituserPa$$wd@SG-TradeIT-10478.servers.mongodirector.com:27017/tradeit_query',
    CONNECTION_STRING_TESTS: 'mongodb://localhost:27017/tradeit_tests', //'mongodb://usrtradeitdb:tradeituserPa$$wd@SG-TradeIT-10478.servers.mongodirector.com:27017/tradeit_tests',
    CONNECTION_STRING_TESTS_QUERY: 'mongodb://localhost:27017/tradeit_test_query', //'mongodb://usrtradeitdb:tradeituserPa$$wd@SG-TradeIT-10478.servers.mongodirector.com:27017/tradeit_test_query',
  },
  ACTION_TYPES: {
    COMMAND: 'command',
    QUERY: 'query',
    COMMAND_TEST: 'command_test',
    QUERY_TEST: 'query_test',
  },
  COMMAND_TOPIC_MAP: {
    //   "AdvisingBankSNSTopic",
    //   "BuyerSNSTopic",
    //   "DeNormalizerSNSTopic",
    //   "DocumentationSNSTopic",
    //   "IssuingBankSNSTopic",
    //   "NotificationSNSTopic",
    //   "SellerSNSTopic",
    //   "TransactionSNSTopic",
    //   "UserGroupSNSTopic"
    //   "GeneralCommandSNSTopic"
    cmdAddNewEntity: 'GeneralCommandSNSTopic',
    cmdUpdateEntity: 'GeneralCommandSNSTopic',
    cmdLoginUser: 'UserGroupSNSTopic',
    cmdAddNewGroup: 'UserGroupSNSTopic',
    cmdAddNewUser: 'UserGroupSNSTopic',
    cmdUpdateGroup: 'UserGroupSNSTopic',
    cmdUpdateUser: 'UserGroupSNSTopic',

  },
};