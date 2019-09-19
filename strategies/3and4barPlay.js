const util = require('util');
const exec = util.promisify(require('child_process').exec);


module.exports.execute = async (alpacaClient) => {

    // First, configure data search parameters such as time aggregate, stocks, and timeframes

    // Get data
    var data = await alpacaClient.getBars('5Min', 'MSFT', {limit: 1000});
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