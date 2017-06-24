module.exports = {
  AWS: {
    SNS_BASE_ARN: 'arn:aws:sns:ap-southeast-2:296927073230:',
  },
  DB: {
    CONNECTION_STRING: 'mongodb://usrtradeitdb:tradeituserPa$$wd@SG-TradeIT-10478.servers.mongodirector.com:27017/tradeit',
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
    cmdLoginUser: 'UserGroupSNSTopic',
    cmdAddNewGroup: 'UserGroupSNSTopic',
    cmdAddNewUser: 'UserGroupSNSTopic',
    cmdUpdateGroup: 'UserGroupSNSTopic',
    cmdUpdateUser: 'UserGroupSNSTopic',

  },
};