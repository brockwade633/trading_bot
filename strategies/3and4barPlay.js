const util = require('util');
const exec = util.promisify(require('child_process').exec);


module.exports.testing = async (alpacaClient) => {

  // Initialize relevant vars

  // Initialize an array 45 long, all empty objects {}
  var bars = new Array(45).fill(0);

  // Setup WebSocket
  const client = alpacaClient.websocket;



  client.onConnect(function() {
    console.log("WebSocket connected - Starting Trading Session");

    // Subscribe to appropriate channels
    client.subscribe(['trade_updates']);

  });

  client.onStockAggSec(function(subject, data) {

  });

  client.onStockAggMin(function(subject, data) {
    
    // Format incoming data
    var newBar = data[0];  // data might get sent in [] like it comes through in the terminal

    // Push on to the front of bars, and pop off the last item 
    bars.unshift(newBar);
    bars.pop();

    // Format data for 1min, 3min, 5min etc. time aggregates
    var oneMinAgg = bars.slice(0, 9);

    // check for 3 bar play

    // check for 4 bar play

    // act appropriately according to above checks

  });

  client.onOrderUpdate(data => {
    console.log(`Order updates: ${JSON.stringify(data)}`);
  });

  client.onDisconnect(() => {
    console.log("WebSocket disconnected - Finished Trading Session");
  });



}



module.exports.execute = async (alpacaClient) => {

    // Setup WebSocket
    const client = alpacaClient.websocket;

    // First, configure data search parameters such as time aggregate, stocks, and timeframes
    var timeInterval = '5Min';
    var stocks = ['MSFT'];
    var resultsLimit = 1000;

    // Get data
    var data = await alpacaClient.getBars(timeInterval, stocks, {limit: resultsLimit});
    console.log("Test Bars: ", data["MSFT"].length);
    var msftBars = data["MSFT"];

    // Filter data for 3 / 4 bar play opportunities
    var resultData = [];
    var count = 0;
    for(var i = 5; i < msftBars.length - 2; i++){
      var prevBars = 0;
      for(var j = 5; j > 0; j--){
        prevBars = prevBars + Math.abs(msftBars[i-j]["o"] - msftBars[i-j]["c"]);
      }
      var avgPrevBars = prevBars / 5;
      
      // Potential igniting bar 
      var bar1Length = msftBars[i]["c"] - msftBars[i]["o"];

      // Is potential igniting bar trending up
      var isbar1Igniting = bar1Length > 0;

      // Is potential igniting bar above average of previous 5 bars
      var isbar1AboveAvg = bar1Length > avgPrevBars;

      // Potential narrow range resting bar
      var bar2Length = msftBars[i+1]["o"] - msftBars[i+1]["c"];

      //Is potential narrow range bar trending down
      var isbar2Decreasing = bar2Length > 0;

      // Are heights of bars 1 & 2 relatively equal
      var isHeightRelEqual = (Math.abs(msftBars[i]["c"] - msftBars[i+1]["o"]) / bar2Length) < 0.25;
      
      // bar1 midway price
      var bar1midpoint = msftBars[i]["c"] - (bar1Length / 2);

      // Is bar2 in the upper 50% of bar1
      var isbar2inUpperbar1 = msftBars[i+1]["c"] > bar1midpoint;

      // bar3
      var bar3Length = msftBars[i+2]["c"] - msftBars[i+2]["o"];

      // Is bar3 trending up
      var isbar3Increasing = bar3Length > 0;

      // Does bar3 break highs of bar1 & bar2
      var isbar3Highest = msftBars[i+2]["c"] > msftBars[i]["c"] && msftBars[i+2]["c"] > msftBars[i+1]["o"];

      if (isbar1Igniting && isbar1AboveAvg && isbar2Decreasing && isHeightRelEqual && isbar2inUpperbar1 && isbar3Increasing && isbar3Highest){
        resultData.push([msftBars[i-3], msftBars[i-2], msftBars[i-1], msftBars[i], msftBars[i+1], msftBars[i+2], msftBars[i+3], msftBars[i+4], msftBars[i+5]]);
        count++;
      }
    }

    console.log("Number of Potential Three Bar Plays: ", count);

    var package = [];
    for (var val of resultData[1]){
      package.push(val["t"]);
      package.push(val["o"]);
      package.push(val["h"]);
      package.push(val["l"]);
      package.push(val["c"]);
    }
    
    //console.log(package);

    const { stdout, stderr } = await exec(`python ~/projects/trading_bot/utils/plot.py ${package}`);

    //console.log("Python log: ", stdout);
}

// Needs work. Should accept a group of (8?) bars in order to check average of previous 5, 
// and check the next 3 for igniting bar, resting bar, and entry bar requirements.
var is3BarPlay = async(bars) => {
  for(var i = 5; i < bars.length - 2; i++){
    var prevBars = 0;
    for(var j = 5; j > 0; j--){
      prevBars = prevBars + Math.abs(bars[i-j]["o"] - bars[i-j]["c"]);
    }
    var avgPrevBars = prevBars / 5;
    
    // Potential igniting bar 
    var bar1Length = bars[i]["c"] - bars[i]["o"];

    // Is potential igniting bar trending up
    var isbar1Igniting = bar1Length > 0;

    // Is potential igniting bar above average of previous 5 bars
    var isbar1AboveAvg = bar1Length > avgPrevBars;

    // Potential narrow range resting bar
    var bar2Length = bars[i+1]["o"] - bars[i+1]["c"];

    //Is potential narrow range bar trending down
    var isbar2Decreasing = bar2Length > 0;

    // Are heights of bars 1 & 2 relatively equal
    var isHeightRelEqual = (Math.abs(bars[i]["c"] - bars[i+1]["o"]) / bar2Length) < 0.25;
    
    // bar1 midway price
    var bar1midpoint = bars[i]["c"] - (bar1Length / 2);

    // Is bar2 in the upper 50% of bar1
    var isbar2inUpperbar1 = bars[i+1]["c"] > bar1midpoint;

    // bar3
    var bar3Length = bars[i+2]["c"] - bars[i+2]["o"];

    // Is bar3 trending up
    var isbar3Increasing = bar3Length > 0;

    // Does bar3 break highs of bar1 & bar2
    var isbar3Highest = bars[i+2]["c"] > bars[i]["c"] && bars[i+2]["c"] > bars[i+1]["o"];

    if (isbar1Igniting && isbar1AboveAvg && isbar2Decreasing && isHeightRelEqual && isbar2inUpperbar1 && isbar3Increasing && isbar3Highest){
      return true;
    }
    else {
      return false;
    }
  }
}

var is4BarPlay = async(bars) => {

}