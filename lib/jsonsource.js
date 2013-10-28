var fs = require('fs');
var readline = require('readline');
var Bacon = require("baconjs").Bacon;
var zlib = require('zlib');


exports.create = function (infilename, n2k, nmea) {
    var rd;
    var messages = [];
    var readerDone = false;
    var filename = infilename;

    startNewReader();


    setInterval(function () {
        if (messages.length > 0) {
            message = messages.shift();
            if (message.pgn) {
                n2k.push(message);
            }
            if (message.type) {
                nmea.push(message);
            }
        } else {
            if (readerDone) {
                startNewReader();
            } else {
                rd.resume();
            }
        }
    }, 10);

    function startNewReader() {

        var inStream = fs.createReadStream(filename);
        if (endsWith(filename, ".gz")) {
            zStream = zlib.createGunzip();
            inStream.pipe(zStream);
            inStream = zStream;
        }

        rd = readline.createInterface({
            input: inStream,
            output: process.stdout,
            terminal: false
        });

        // Brute force parsing of object literals: read lines in until eval succeeds
        // or we have failed because the file has some bogus data
        var jsonAccumulator = "(";
        rd.on('line', function (line) {
            jsonAccumulator += line;
            if (jsonAccumulator.length > 10000) {
                console.log("Can not find valid data");
                console.log(jsonAccumulator);
                jsonAccumulator = "(";
            }
            try {
                var result = eval(jsonAccumulator + ")");
                messages.push(result);
                rd.pause();
                jsonAccumulator = "(";
            } catch (ex) {
            }
        });
        rd.on('close', function () {
            readerDone = true;
        });
        readerDone = false;
    }

    function endsWith(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }
};


exports.startWriting = function(n2k, nmea, filename) {
  var out = fs.createWriteStream(filename);
  n2k.onValue(function (msg) {
    out.write(JSON.stringify(msg) + '\n');
  })
  nmea.json.onValue(function (msg) {
    out.write(JSON.stringify(msg) + '\n');
  })
}
