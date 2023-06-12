function getCurrentTime() {
    var now = new Date();
    return parseTime(now);
}

function parseTime(time) {
    var year = time.getFullYear();
    var month = padZero(time.getMonth() + 1);
    var day = padZero(time.getDate());
    var hours = padZero(time.getHours());
    var minutes = padZero(time.getMinutes());
    var seconds = padZero(time.getSeconds());

    var formattedTime = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
    return formattedTime;
}

function padZero(number) {
    return (number < 10 ? '0' : '') + number;
}

module.exports = { getCurrentTime, parseTime };