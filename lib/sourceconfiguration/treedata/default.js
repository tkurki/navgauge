var Bacon = require("baconjs").Bacon;

var defaultStreams = [
  'navigation.headingNorth',
  'navigation.depth',
  'navigation.speedOverGround',
  'environmental.apparentWindDirection',
  'environmental.position'
]

exports.createFromBundle = function(bundle) {
  var compositeStream = new Bacon.Bus();
  defaultStreams.forEach(function(id) {
    compositeStream.plug(bundle.getTypeStream(id).throttle(1000));
  })
  return compositeStream;
};
