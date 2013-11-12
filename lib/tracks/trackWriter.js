var fs = require('fs');
var async = require('async');
var timestamps;
var coordinates;

process.on('exit', function() {
  if (timestamps != undefined) {
    timestamps.close();
  }
  if (coordinates != undefined) {
    coordinates.close();
  }
});

exports.createTrackWriter = function (positionStream) {
  timestamps = fs.createWriteStream("track_timestamps.txt");
  coordinates = fs.createWriteStream("track_coordinates.txt");

  positionStream.throttle(1 * 1000).subscribe(function(event) {
    write(event.value());
  });
}

exports.registerTrackApi = function (app) {
  app.get('/track', function (req, res) {
    res.contentType("text/javascript");
    res.write('{ "type": "Feature","geometry": {"type": "MultiPoint","coordinates": [');
    async.series([
      function (done) {
        fs.readFile('track_coordinates.txt', 'utf8', function (err, data) {
          res.write(data);
          res.write(']},"properties": {"time": [');
          done(null, null);
        });
      },
      function (done) {
        fs.readFile('track_timestamps.txt', 'utf8', function (err, data) {
          res.write(data);
          res.write(']}}');
          done(null, null);
        });
      }
    ], function (err, results) {
      res.end();
    });
  });
}

/*
 {
 "type": "Feature",
 "geometry": {
 "type": "MultiPoint",
 "coordinates": [array of [lng,lat] coordinates]
},
"properties": {
  "time": [array of UNIX timestamps]
}
}
 */
function write(msg) {
  coordinates.write('[' + msg.lon + ',' + msg.lat + '],\n' );
  timestamps.write('[' + Date.now() + '],\n' );
}