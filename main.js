var threeAndFourBarPlay = require("./strategies/3and4barPlay");
var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
var secretsManager = new AWS.SecretsManager({apiVersion: '2017-10-17'});
const Alpaca = require('@alpacahq/alpaca-trade-api');
var alpaca;

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

module.exports.connect = async () => {
    await init();
    const client = alpaca.websocket
    client.onConnect(async function() {
        console.log("Connected to trading websocket");
        //client.subscribe(['trade_updates', 'account_updates']);

        await threeAndFourBarPlay.execute(alpaca);

        setTimeout(() => {
        client.disconnect();
        }, 10 * 1000)
    })
    client.onDisconnect(() => {
        console.log("Disconnected")
    })
    client.onStateChange(newState => {
        console.log(`State changed to ${newState}`)
    })
    client.onOrderUpdate(data => {
        console.log(`Order updates: ${JSON.stringify(data)}`)
    })
    client.onAccountUpdate(data => {
        console.log(`Account updates: ${JSON.stringify(data)}`)
    })
    client.onStockTrades(function(subject, data) {
        console.log(`Stock trades: ${subject}, ${data}`)
    })
    client.onStockQuotes(function(subject, data) {
        console.log(`Stock quotes: ${subject}, ${data}`)
    })
    client.onStockAggSec(function(subject, data) {
        console.log(`Stock agg sec: ${subject}, ${data}`)
    })
    client.onStockAggMin(function(subject, data) {
        console.log(`Stock agg min: ${subject}, ${data}`)
    })
    client.connect();
}