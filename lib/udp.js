var dgram = require('dgram');

exports.create = function (nmeasource, argv) {
    if (argv.b) {
        var udpSocket = dgram.createSocket("udp4");
        udpSocket.bind(argv.b, function () {
            udpSocket.setBroadcast(true);
        });
        nmeasource.onValue(function (data) {
            var message = new Buffer(data + "\n");
            udpSocket.send(message, 0, message.length, 7777, argv.b);
        });
    }
}
