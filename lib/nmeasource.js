var nmea = require('nmea');

exports.create = function (jsonStream, rawStream, nmeaArg) {
  var FILEPREFIX = 'file:';
  var cmdArguments = ['-c', 'gpspipe -r'];
  var options = {};
  if (nmeaArg.indexOf(FILEPREFIX) === 0) {
    cmdArguments = ['-c', 'while true ; do exec < ' + nmeaArg.substr(FILEPREFIX.length, nmeaArg.length) + '; while read line; do echo $line; sleep 1; done; done'];
  }
  rl = require('readline');

  var nmeasource = require('child_process').spawn('sh', cmdArguments);
  linereader = rl.createInterface(nmeasource.stdout, nmeasource.stdin);


  var shouldTransmit = function (nmeaMessage) {
    return typeof nmeaMessage != 'undefined';
  };

  linereader.on('line', function (data) {
    rawStream.push('' + data);
    var nmeaMessage = nmea.parse('' + data);
    if (shouldTransmit(nmeaMessage)) {
      jsonStream.push(nmeaMessage);
    }
  });

  nmeasource.stderr.on('data', function (data) {
    console.log('nmea-err:' + data);
  });

  nmeasource.on('close', function (code) {
    console.log('nmea process exited with code ' + code);
  });

  return nmeasource;
};