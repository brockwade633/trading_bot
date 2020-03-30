const WebSocket = require('ws');
const fs = require('fs');
var testBars = fs.readFileSync("/Users/brockwade/projects/trading_bot/utils/bars.txt");
var data = JSON.parse(testBars);

// start a local web socket to test trading code
module.exports.startWS = () => {
    var serverPort = 8080;
    const wss = new WebSocket.Server({ port: serverPort });
    console.log(`Starting local Web Socket on port ${serverPort}...`);
    wss.on('connection', ws => {
        var index = 200;
        sendData(ws, index);
    });
}

var sendData = (ws, i) => {
    i++;
    console.log(i);
    ws.send(JSON.stringify([data[i]]));
    if (i < data.length){
        setTimeout(function(){ sendData(ws, i); }, 1000);
    }
}