var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
var secretsManager = new AWS.SecretsManager({apiVersion: '2017-10-17'});
const Alpaca = require('@alpacahq/alpaca-trade-api');
var alpaca;
var headers;

var init = async() => {
  var secretData = await secretsManager.getSecretValue({SecretId: "AlpacaAPIKeys"}).promise(); 
  console.log("Secrets: ", secretData);
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

var connect = async () => {
    await init();
    const client = alpaca.websocket
    client.onConnect(async function() {
        console.log("Connected")
        client.subscribe(['trade_updates', 'account_updates']);

        // place order test
        const orders = require('./controllers/orders');
        // var newOrder = await orders.createOrder(alpaca, 'AAPL', 10, 'buy', 'market', 'day', null, null, null, false);
        // console.log("newOrder: ", newOrder);

        // orders test
        var orderResults = await orders.getOrder(alpaca, '98d9e310-0b47-43a3-917e-ca5881b10405');
        console.log("OrderResults: ", orderResults);

        var clientOrderResults = await orders.getOrderByClientId(alpaca, '03590fd7-1f10-4aa7-a174-92772b138d9c');
        console.log("Client OrderResults: ", clientOrderResults);

        // cancel order test
        // var cancelResult = await orders.cancelOrder(alpaca, '98d9e310-0b47-43a3asdf-917e-ca5881b10405');
        // console.log("Cancel orderResult: ", cancelResult);

        // positions test
        const positions = require('./controllers/positions');
        var positionsResults = await positions.getPositions(alpaca);
        console.log("PositionsResults: ", positionsResults);

        // assets test
        const assets = require('./controllers/assets');
        var assetsResults = await assets.getAssets(alpaca);
        console.log("First Asset Result: ", assetsResults[0]);

        // calendar test
        const calendar = require('./controllers/calendar');
        var calendarResult = await calendar.getCalendar(alpaca, '2019-06-01', '2019-06-15');
        console.log("calendar: ", calendarResult);

        // clock test
        const clock = require('./controllers/clock');
        var clockResult = await clock.getClock(headers);
        console.log("Clock: ", clockResult);

        setTimeout(() => {
        client.disconnect()
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
connect();