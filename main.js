var threeAndFourBarPlay = require("./strategies/3and4barPlay");
var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
var secretsManager = new AWS.SecretsManager({apiVersion: '2017-10-17'});
const Alpaca = require('@alpacahq/alpaca-trade-api');
var alpaca;
var headers;
var test = require('./test');

var init = async() => {
  var secretData = await secretsManager.getSecretValue({SecretId: "AlpacaAPIKeys"}).promise(); 
  var secrets = JSON.parse(secretData.SecretString);
  alpaca = new Alpaca({
    keyId: secrets.ALPCA_PT_KEYID,
    secretKey: secrets.ALPCA_PT_SECRETKEY,
    paper: true
  }); 
  headers = {
    'APCA-API-KEY-ID' : secrets.ALPCA_PT_KEYID,
    'APCA-API-SECRET-KEY' : secrets.ALPCA_PT_SECRETKEY
  }
}

module.exports.trade = async () => {
    await init();
    await threeAndFourBarPlay.execute(alpaca);
    
}

module.exports.test = async () => {
    await init();
    await test.testFunc(alpaca);
}