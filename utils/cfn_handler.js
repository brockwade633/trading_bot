var AWS = require('aws-sdk');
AWS.config.update({region: 'us-west-2'});
var CFN = new AWS.CloudFormation({apiVersion: '2017-10-17'});

module.exports.cleanPrevStack = async () => {
    var stack_name = process.argv[1];
    if (!stack_name) throw Error("Stack Name Not Provided!");
    var describeParams = {
        StackStatusFilter: [
            "CREATE_COMPLETE"
        ]
    };
    var describeResponse = await CFN.listStacks(describeParams).promise();
    var stackFound = false;
    for (var stack of describeResponse.StackSummaries){
        if (stack.StackName == stack_name) stackFound = true;
    }
    if(stackFound){
        // delete the stack
        var delParams = {
            StackName: stack_name
        };
        var delResponse = await CFN.deleteStack(delParams).promise();
        console.log(delResponse);
    }
    else{
        // do nothing
        console.log("No Stack Found");
    }
}