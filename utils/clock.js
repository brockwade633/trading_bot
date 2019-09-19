const r2 = require('r2');
var URL = "https://paper-api.alpaca.markets/v2/clock";
var getClock = async (headers) => {
    var clockData = await r2.get(URL, {headers}).json;
    return clockData;
}

module.exports.getClock = getClock;