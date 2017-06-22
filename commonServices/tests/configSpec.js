describe("Common Services Configuration Settings", function() {
  const configService = require('../configService');
  it("SNS Base ARN has a value", function() {
    expect(configService.AWS.SNS_BASE_ARN).toBeTruthy(); 
  });
});