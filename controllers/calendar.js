
var getCalendar = async (alpaca, startDate, endDate) => {
    var calendarData = alpaca.getCalendar({start : startDate, end : endDate});
    return calendarData;
}

module.exports.getCalendar = getCalendar;