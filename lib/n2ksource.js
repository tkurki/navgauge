var Bacon = require("baconjs").Bacon;

exports.create = function (stream, args) {
  var ACTISENSEPREFIX = 'actisense:';
  var FILEPREFIX = 'file:';
  var cmdArguments = [];
  args.split(',').map(function (sourceParam) {
    if (sourceParam.indexOf(ACTISENSEPREFIX) === 0) {
      createActisenseSource(sourceParam.substring(ACTISENSEPREFIX.length, sourceParam.length), stream);
    }
    if (sourceParam.indexOf(FILEPREFIX) === 0) {
      createFilesource(sourceParam.substring(FILEPREFIX.length, sourceParam.length), stream);
    }
  });
}
function createActisenseSource(deviceName, stream) {
  startShellWithArguments(['-c', 'actisense-serial ' + deviceName + '| analyzer -json'], stream);
}

function createFilesource(filename, stream) {
  startShellWithArguments(['-c',
    'while true ; ' +
      'do exec < ' + filename + '; ' +
      'while read line; ' +
      'do echo $line; sleep 0; ' +
      'done; done | ' +
      'analyzer -json']);
}

function starteShellWithArguments(cmdArguments) {
  rl = require('readline');

  var n2ksource = require('child_process').spawn('sh', cmdArguments);
  linereader = rl.createInterface(n2ksource.stdout, n2ksource.stdin);

  linereader.on('line', function (data) {
    var pgn = JSON.parse(data);
    stream.push(pgn);
  });

  n2ksource.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });

  n2ksource.on('close', function (code) {
    console.log('n2k process exited with code ' + code);
  });

  return n2ksource;
};

