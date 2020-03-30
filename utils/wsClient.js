const WebSocket = require('ws');
var parseAggMinData = require('../strategies/TBP/3and4barPlay').minAggCB;

// subscribe to local web socket
module.exports.connect = () => {
    const url = 'ws://localhost:8080'
    const connection = new WebSocket(url);
    
    connection.onmessage = (e) => {
        parseAggMinData("", e.data);
    }
}

