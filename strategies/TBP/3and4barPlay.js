const util = require('util');
const exec = util.promisify(require('child_process').exec);
var _ = require('lodash');


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
    
    console.log("New web socket data: ", data);

    console.log("");
    var currDate = new Date();
    console.log("Current Time: ", currDate.getHours() + ":" + currDate.getMinutes());
    console.log("");

    // Check first if there is any dead time elapsed between incoming data and last received, longer than a minute. 
    // If so, hydrate the queue with last received data for the duration of dead time.
    

    // Push on to the front of bars, and pop off the last item 
    bars.unshift(data);
    bars.pop();

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
      const { stdout, stderr } = await exec(`python ~/projects/trading_bot/utils/plot.py ${formatForPlot(oneMinAgg)}`);
      client.disconnect();
    }
    else if(threeBPThreeMin){
      console.log("THREE BAR PLAY!");
      // Buy Stock
      
      // Save plot of buy entry scenario as an image
      const { stdout, stderr } = await exec(`python ~/projects/trading_bot/utils/plot.py ${formatForPlot(threeMinAgg)}`);
      client.disconnect();
    }
    else if(threeBPFiveMin){
      console.log("THREE BAR PLAY!");
      // Buy Stock
      
      // Save plot of buy entry scenario as an image
      const { stdout, stderr } = await exec(`python ~/projects/trading_bot/utils/plot.py ${formatForPlot(fiveMinAgg)}`);
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

var is3BarPlay = async(bars) => {

  if(!checkBars(bars)){
    return false;
  }

  var prevBarsTotal = 0;
  var prevBars = bars.slice(0, 6);
  for (var bar of prevBars) {
    prevBarsTotal = prevBarsTotal + Math.abs(bar["o"] - bar["c"]);
  }
  var avgPrevBars = prevBarsTotal / 5;
  var ignitingBar = bars[bars.length-3];
  var restingBar = bars[bars.length-2];
  var entryBar = bars[bars.length-1];

  // Potential igniting bar 
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

  if (isIgBarIgniting && isIgBarAboveAvg && isRestingBarDecreasing && isHeightRelEqual && isRestingBarinUpperIgBar && isEntryBarIncreasing && isEntryBarHighest){
    return true;
  }
  else {
    return false;
  }
}

var is4BarPlay = async(bars) => {

}

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