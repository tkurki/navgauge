var fs = require('fs');
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