

var getOrders = async (alpaca) => {
    var ordersData = await alpaca.getOrders();
    return ordersData;
}

var createOrder = async (alpaca, SYMBOL, QTY, SIDE, TYPE, TIME_IN_FORCE, LIMIT_PRICE, STOP_PRICE, CLIENT_ORDER_ID, EXTENDED_HOURS) => {
    var returnData = await alpaca.createOrder({symbol : SYMBOL, 
                                                qty : QTY, 
                                                side : SIDE, 
                                                type : TYPE, 
                                                time_in_force : TIME_IN_FORCE,
                                                limit_price : LIMIT_PRICE,
                                                stop_price : STOP_PRICE,
                                                client_order_id : CLIENT_ORDER_ID,
                                                extended_hours : EXTENDED_HOURS});
    return returnData;
}

var getOrder = async (alpaca, id) => {
    var orderData = await alpaca.getOrder(id);
    return orderData;
}

var getOrderByClientId = async (alpaca, id) => {
    var orderData = await alpaca.getOrderByClientId(id);
    return orderData;
}

var cancelOrder = async (alpaca, id) => {
    var returnData = await alpaca.cancelOrder(id);
    return returnData;
}

module.exports.getOrders = getOrders;
module.exports.createOrder = createOrder;
module.exports.getOrder = getOrder;
module.exports.getOrderByClientId = getOrderByClientId;
module.exports.cancelOrder = cancelOrder;