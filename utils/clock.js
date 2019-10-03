const req = require('request-promise-native');
var URL = "https://paper-api.alpaca.markets/v2/clock";
var getClock = async (headers) => {
    var clockData = await req.get(URL, {headers: headers});
    return clockData;
}

module.exports.getClock = getClock;