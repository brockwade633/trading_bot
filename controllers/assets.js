
var getAssets = async (alpaca) => {
    var assetsData = alpaca.getAssets();
    return assetsData;
}

var getAsset = async (alpaca, symbol) => {
    var assetData = alpaca.getAsset(symbol);
    return assetData;
}

module.exports.getAssets = getAssets;
module.exports.getAsset = getAsset;