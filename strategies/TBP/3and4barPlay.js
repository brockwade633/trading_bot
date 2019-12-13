const util = require('util');
const exec = util.promisify(require('child_process').exec);
var _ = require('lodash');
const MILLI = 1000;
var AWS = require('aws-sdk');
var S3 = new AWS.S3({apiVersion: '2017-10-17'});


module.exports.execute = async (alpacaClient) => {

  // Initialize relevant vars

  // Initialize a Queue 45 long
  var bars = new Array(45).fill(0);

  // Setup WebSocket
  const client = alpacaClient.websocket;
  client.connect();


  client.onConnect(function() {
    console.log("WebSocket connected - Starting Trading Session");

    // Subscribe to appropriate channels
    client.subscribe(['trade_updates', 'AM.AAPL']);

  });

  client.onStockAggSec(function(subject, data) {

  });

  client.onStockAggMin(async function(subject, data) {
    
    // Format incoming data?
    var incomingData = JSON.parse(data)[0];
    
    console.log("New web socket data: ", incomingData);

    console.log("");
    var currDate = new Date();
    console.log("Current Time: ", currDate.getHours() + ":" + currDate.getMinutes());
    console.log("");

    // Check first if there is any dead time elapsed between incoming data and last received, longer than a minute. 
    // If so, hydrate the queue with last received data for the duration of dead time.
    // If not, just push on the new minute's data and pop off the oldest bar's data.
    bars = incrementBars(bars, incomingData);

    console.log("Current Bars: ", bars);

    // Format data for 1min, 3min, 5min etc. time aggregates
    var oneMinAgg = bars.slice(0, 9);
    var threeMinAgg = _.filter(bars, function(item) { return (_.indexOf(bars, item) + 1) % 3 == 0; });
    var fiveMinAgg = _.filter(bars, function(item) { return (_.indexOf(bars, item) + 1) % 5 == 0; });

    // check for 3 bar play
    var threeBPOneMin = is3BarPlay(oneMinAgg);
    var threeBPThreeMin = is3BarPlay(threeMinAgg);
    var threeBPFiveMin = is3BarPlay(fiveMinAgg);

    // check for 4 bar play

    // act appropriately according to above checks
    if(threeBPOneMin){
      console.log("THREE BAR PLAY!");
      // Buy Stock
      
      // Save plot of buy entry scenario as an image
      const { stdout, stderr } = await exec(`python /usr/src/bot/utils/plot.py ${formatForPlot(oneMinAgg)}`);

      // Upload to s3
      await uploadImage();
      client.disconnect();
    }
    else if(threeBPThreeMin){
      console.log("THREE BAR PLAY!");
      // Buy Stock
      
      // Save plot of buy entry scenario as an image
      const { stdout, stderr } = await exec(`python /usr/src/bot/utils/plot.py ${formatForPlot(threeMinAgg)}`);

      // Upload to s3
      await uploadImage();
      client.disconnect();
    }
    else if(threeBPFiveMin){
      console.log("THREE BAR PLAY!");
      // Buy Stock
      
      // Save plot of buy entry scenario as an image
      const { stdout, stderr } = await exec(`python /usr/src/bot/utils/plot.py ${formatForPlot(fiveMinAgg)}`);

      // Upload to s3
      await uploadImage();
      client.disconnect();
    }
    else{
      // nothing
    }
  });

  client.onOrderUpdate(data => {
    console.log(`Order updates: ${JSON.stringify(data)}`);
  });

  client.onDisconnect(() => {
    console.log("WebSocket disconnected - Finished Trading Session");
  });
}

var is3BarPlay = (data) => {

  if(!checkBars(data)){
    console.log("Bars are not filled up yet");
    return false;
  }
  else{
    var prevBarsTotal = 0;
    var prevBars = data.slice(0, 6);
    for (var bar of prevBars) {
      prevBarsTotal = prevBarsTotal + Math.abs(bar["o"] - bar["c"]);
    }
    var avgPrevBars = prevBarsTotal / 5;
    var ignitingBar = data[data.length-3];
    var restingBar = data[data.length-2];
    var entryBar = data[data.length-1];

    // Potential igniting bar
    console.log("Data: ", data); 
    console.log("igniting bar: ", ignitingBar);
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

module.exports.is3BarPlay = is3BarPlay;

// var is4BarPlay = async(bars) => {

// }

var incrementBars = (currBars, newBar) => {
  var millisSinceLastData = newBar["s"] - currBars[0]["e"];
  var minutesSinceLastData = (millisSinceLastData > 60 * MILLI) ? millisSinceLastData / (60 * MILLI) : 1;
  console.log("minutes since last data: ", minutesSinceLastData);
  for (i = 0; i < minutesSinceLastData; i++){
    currBars.unshift(newBar);
    currBars.pop();
  }
  return currBars;
}

module.exports.incrementBars = incrementBars;

var formatForPlot = (agg) => {
  var dataTuple = [];
  for (var bar of agg){
    package.push(bar["t"]);
    package.push(bar["o"]);
    package.push(bar["h"]);
    package.push(bar["l"]);
    package.push(bar["c"]);
  }
  return dataTuple;
}

var checkBars = (bars) => {
  for(var bar of bars){
    if(typeof bar != 'object') return false;
  }
  return true;
}

var uploadImage = async () => {
  var now = new Date();
  var fileName = String(now.getMonth() + 1) + String(now.getDate()) + String(now.getFullYear()) + "_plot.pdf";
  var file = fs.readFileSync(fileName);
  var params = {
      Body: file,
      Bucket: "tradingartifacts",
      Key: `TBP/${fileName}.pdf`
  }
  await S3.putObject(params).promise();
}