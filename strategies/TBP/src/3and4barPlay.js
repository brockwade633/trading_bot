// Deps
var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
var S3 = new AWS.S3({apiVersion: '2017-10-17'});
var secretsManager = new AWS.SecretsManager({apiVersion: '2017-10-17'});
const Alpaca = require('@alpacahq/alpaca-trade-api');
var _ = require('lodash');
// Files & globals
const config = require('../../../utils/alpacaConfig');
const MILLI = 1000;
let alpaca;
let bars;

var init = async (isPaper) => {
  const secretData = await secretsManager.getSecretValue({SecretId: "AlpacaAPIKeys"}).promise(); 
  const secrets = JSON.parse(secretData.SecretString);
  const key_id = (isPaper) ? secrets.ALPCA_PT_KEYID : secrets.ALPCA_KEYID;
  const secret_key = (isPaper) ? secrets.ALPCA_PT_SECRETKEY : secrets.ALPCA_SECRETKEY;
  alpaca = new Alpaca({
      keyId: key_id,
      secretKey: secret_key,
      paper: isPaper
  }); 
  bars = new Array(36).fill(0);
}

module.exports.execute = async () => {

  // Initialize client and relevant vars
  await init(config.environment == "Paper");
  var wsClient = alpaca.websocket;

  // Start WebSocket
  wsClient.connect();

  wsClient.onConnect(function() {
    console.log(`WebSocket connected - Starting ${config.environment} Trading Session`);
  
    // Subscribe to appropriate channels
    wsClient.subscribe(['trade_updates', 'AM.AAPL']);
  
  });
  
  wsClient.onStockAggMin(processMinAggs);
  
  wsClient.onOrderUpdate(data => {
    console.log(`Order updates: ${JSON.stringify(data)}`);
  });
  
  wsClient.onDisconnect(() => {
    console.log("WebSocket disconnected - Finished Trading Session");
  });

}

var processMinAggs = async (subject, data) => {
  // Parse incoming data
  var incomingData = JSON.parse(data)[0];

  // Check first if there is any dead time elapsed between incoming data and last received, longer than a minute. 
  // If so, hydrate the queue with last received data for the duration of dead time.
  // If not, just push on the new minute's data and pop off the oldest bar's data.
  bars = incrementBars(bars, incomingData);

  // Format data for 1min, 3min, 5min etc. time aggregates
  var oneMinAgg = bars.slice(0, 8);
  var threeMinAgg = bars.filter(function(val, index){ return (index % 3 == 0) && (index < 3*8); });
  var fiveMinAgg = bars.filter(function(val, index){ return (index % 5 == 0) && (index < 5*8); });

  // check for 3 bar play
  var threeBPOneMin = is3BarPlay(oneMinAgg);
  var threeBPThreeMin = is3BarPlay(threeMinAgg);
  var threeBPFiveMin = is3BarPlay(fiveMinAgg);

  // ToDo: Additionally check for 4 bar play

  // act appropriately according to above checks
  if(threeBPOneMin){
    console.log("THREE BAR PLAY! (1 min aggregate)");
    // Buy Stock here 
    client.disconnect();
  }
  else if(threeBPThreeMin){
    console.log("THREE BAR PLAY! (3 min aggregate)");
    // Buy Stock here
    client.disconnect();
  }
  else if(threeBPFiveMin){
    console.log("THREE BAR PLAY! (5 min aggregate)");
    // Buy Stock here 
    client.disconnect();
  }
}
module.exports.processMinAggs = processMinAggs;

var is3BarPlay = (data) => {

  if(!checkBars(data)){
    console.log("Bars are not filled up yet");
    return false;
  }
  else{
    var prevBarsTotal = 0;
    var prevBars = data.slice(3);
    for (var bar of prevBars) {
      prevBarsTotal = prevBarsTotal + Math.abs(bar["o"] - bar["c"]);
    }
    var avgPrevBars = prevBarsTotal / 5;
    var ignitingBar = data[2];
    var restingBar = data[1];
    var entryBar = data[0];

    // Potential igniting bar
    //console.log("Data: ", data); 
    //console.log("igniting bar: ", ignitingBar);
    var igBarLength = ignitingBar["c"] - ignitingBar["o"];

    // Is potential igniting bar trending up
    var isIgBarIgniting = igBarLength > 0;

    // Is potential igniting bar above average of previous 5 bars
    var isIgBarAboveAvg = igBarLength > avgPrevBars;

    // Potential narrow range resting bar
    var restingBarLength = restingBar["o"] - restingBar["c"];

    //Is potential narrow range bar trending down
    var isRestingBarDecreasing = restingBarLength > 0;

    // Are heights of igniting bar & resting bar relatively equal
    var isHeightRelEqual = (Math.abs(ignitingBar["c"] - restingBar["o"]) / restingBarLength) < 0.25;
    
    // bar1 midway price
    var igBarMidpoint = ignitingBar["c"] - (igBarLength / 2);

    // Is bar2 in the upper 50% of bar1
    var isRestingBarinUpperIgBar = restingBar["c"] > igBarMidpoint;

    // bar3
    var entryBarLength = entryBar["c"] - entryBar["o"];

    // Is bar3 trending up
    var isEntryBarIncreasing = entryBarLength > 0;

    // Does bar3 break highs of bar1 & bar2
    var isEntryBarHighest = entryBar["c"] > ignitingBar["c"] && entryBar["c"] > restingBar["o"];

    return (isIgBarIgniting && isIgBarAboveAvg && isRestingBarDecreasing && isHeightRelEqual && isRestingBarinUpperIgBar && isEntryBarIncreasing && isEntryBarHighest);
  }
}

var is4BarPlay = async(data) => {
  // ToDo: implememt 4 bar play validations
}

var incrementBars = (currBars, newBar) => {
  var millisSinceLastData = newBar["s"] - currBars[0]["e"];
  var minutesSinceLastData = (millisSinceLastData > 60 * MILLI) ? millisSinceLastData / (60 * MILLI) : 1;
  //console.log("minutes since last data: ", minutesSinceLastData);
  for (i = 0; i < minutesSinceLastData; i++){
    currBars.unshift(newBar);
    currBars.pop();
  }
  return currBars;
}

var checkBars = (bars) => {
  for(var bar of bars){
    if(typeof bar != 'object') return false;
  }
  return true;
}
module.exports.checkBars = checkBars;