var AWS = require('aws-sdk');
AWS.config.update({region: 'us-west-2'});
var ECR = new AWS.ECR({apiVersion: '2017-10-17'});

module.exports.cleanPrevImage = async () => {
    var repo_name = "tradingcluster";
    var image_tag = process.argv[1];
    if (!image_tag) throw Error("Image Tag Not Provided!");
    var params = {
        imageIds: [
            {
                imageTag: image_tag
            }
        ],
        repositoryName: repo_name
    };
    var getResponse = await ECR.batchGetImage(params).promise();
    if (getResponse.images.length == 1 && getResponse.failures.length == 0){
        // delete the image
        var delResponse = await ECR.batchDeleteImage(params).promise();
        if (delResponse.failures.length == 0){
            console.log(`Deleted ${image_tag} succesfully`);
        }
        else{
            throw Error(`${delResponse.failures}`);
        }
    }
    else{
        // do nothing
        console.log("Image not found");
    }
    
}