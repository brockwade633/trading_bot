

var getPosition = async (alpaca, symbol) => {
    var positionData = await alpaca.getPosition(symbol);
    return positionData;
}

var getPositions = async (alpaca) => {
    var positionsData = await alpaca.getPositions();
    return positionsData;
}

module.exports.getPosition = getPosition;
module.exports.getPositions = getPositions;