var Bacon = require("baconjs").Bacon;
var navi = require('../naviutils.js');


exports.boat = {
  configureStreams: function (streams) {
    /* { type: 'track-info',
     trackTrue: 224.44,
     trackMagnetic: 224.44,
     speedKnots: 5.81,
     speedKmph: 0,
     talker_id: 'II' }*/
//    streams.nmea.raw.log();
//    streams.nmea.json.log();     
    streams.gaugeData.plug(streams.nmea.json.filter(function (msg) {
      return msg.type === 'track-info'
    }).flatMap(function (msg) {
        return Bacon.fromArray([
          {
            type: 'course',
            heading: msg.trackTrue},
          {
            type: 'speed',
            knots: msg.speedKnots
          }
        ]);
      }));
    /*{ type: 'geo-position',
     timestamp: '095559',
     lat: '6005.071',
     latPole: 'N',
     lon: '02332.346',
     lonPole: 'E',
     status: 'valid',
     talker_id: 'GP' }*/
    streams.gaugeData.plug(streams.nmea.json.filter(function (msg) {
      return msg.type === 'geo-position'
    }).map(function (msg) {
        return {
          type: 'position',
          lat: Number(msg.lat.substring(0, 2)) + Number(msg.lat.substring(2, msg.lat.length)) / 60,
          lon: Number(msg.lon.substring(0, 3)) + Number(msg.lon.substring(3, msg.lon.length) / 60)
        }
      }));
    /*
     { type: 'wind',
     angle: '313',
     reference: 'T',
     speed: '08.16',
     units: 'N',
     status: 'A',
     talker_id: 'II' }
     */
    streams.gaugeData.plug(streams.nmea.json.filter(function (msg) {
      return msg.type === 'wind'
    }).map(function (msg) {
        switch (msg.reference) {
          case 'T':
            return {
              type: 'wind',
              reference: 'true boat',
              speed: navi.knots2MetersPerSecond(Number(msg.speed)),
              angle: Number(msg.angle)
            };
          case 'R':
            return {
              type: 'wind',
              reference: 'apparent',
              speed: navi.knots2MetersPerSecond(Number(msg.speed)),
              angle: Number(msg.angle)
            }
        }
      }));

    streams.gaugeData.plug(streams.nmea.json.filter(function (msg) {
      return msg.type === 'depth-transducer'
    }).map(function (msg) {
        return {
          type: 'depth',
          depth: msg.depth
        }
      }));
  }
}

