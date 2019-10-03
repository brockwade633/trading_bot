const req = require('request-promise-native');
const polygonBasePath = "https://api.polygon.io/";

module.exports.API = async (path, queryparams, options) => {
    var uri = polygonBasePath + path + formatQueryStrings(queryparams);
    var result = await req(uri, options);
    return result;
}

function formatQueryStrings(params){
    var startStr = "";
    for (var key of Object.keys(params)){
        var kvPair = key + "=" + params[key];
        (startStr.length == 0) ? startStr += "?" + kvPair : startStr += "&" + kvPair;
    }
    return startStr;
}