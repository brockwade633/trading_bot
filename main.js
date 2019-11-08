var threeAndFourBarPlay = require("./strategies/TBP/3and4barPlay");
var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
var secretsManager = new AWS.SecretsManager({apiVersion: '2017-10-17'});
const Alpaca = require('@alpacahq/alpaca-trade-api');
var headers;

var initPaper = async() => {
    var secretData = await secretsManager.getSecretValue({SecretId: "AlpacaAPIKeys"}).promise(); 
    var secrets = JSON.parse(secretData.SecretString);
    var alpaca = new Alpaca({
        keyId: secrets.ALPCA_PT_KEYID,
        secretKey: secrets.ALPCA_PT_SECRETKEY,
        paper: true
    }); 
    headers = {
        'APCA-API-KEY-ID' : secrets.ALPCA_PT_KEYID,
        'APCA-API-SECRET-KEY' : secrets.ALPCA_PT_SECRETKEY
    }
    return alpaca;
}

var initLive = async() => {
    var secretData = await secretsManager.getSecretValue({SecretId: "AlpacaAPIKeys"}).promise();
    var secrets = JSON.parse(secretData.SecretString);
    var alpaca = new Alpaca({
        keyId: secrets.ALPCA_KEYID,
        secretKey: secrets.ALPCA_SECRETKEY,
        paper: false
    });
    headers = {
        'APCA-API-KEY-ID' : secrets.ALPCA_KEYID,
        'APCA-API-SECRET-KEY' : secrets.ALPCA_SECRETKEY
    }
    return alpaca;
}

module.exports.tradePaper = async () => {
    var alpacaPaper = await initPaper();
    await threeAndFourBarPlay.execute(alpacaPaper);
}

module.exports.tradeLive = async () => {
    var alpacaLive = await initLive();
    await threeAndFourBarPlay.execute(alpacaLive);
}