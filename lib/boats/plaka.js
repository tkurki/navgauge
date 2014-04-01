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
    var trackInfo = streams.nmea.json.filter(function (msg) {
      return msg.type === 'track-info'
    });
    streams.gaugeData.plug(trackInfo.flatMap(function (msg) {
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
    trackInfo.onValue(function(msg){
      streams.treeData.push({
        id : 'navigation.courseOverGround',
        value: msg.trackTrue,
        source: {
          type: 'nmea',
          id: '--',
          timestamp: new Date(),
          sentence: '--'
        }
      });
      streams.treeData.push({
        id: 'navigation.speedOverGround',
        value: msg.speedKnots,
        source: {
          type: 'nmea',
          id: '--',
          timestamp: new Date(),
          sentence: '--'
        }
      });
    });
    /*{ type: 'geo-position',
     timestamp: '095559',
     lat: '6005.071',
     latPole: 'N',
     lon: '02332.346',
     lonPole: 'E',
     status: 'valid',
     talker_id: 'GP' }*/
    var geoPosition = streams.nmea.json.filter(function (msg) {
      return msg.type === 'geo-position'
    });
    streams.gaugeData.plug(geoPosition.map(function (msg) {
      return {
        type: 'position',
        lat: Number(msg.lat.substring(0, 2)) + Number(msg.lat.substring(2, msg.lat.length)) / 60,
        lon: Number(msg.lon.substring(0, 3)) + Number(msg.lon.substring(3, msg.lon.length) / 60)
      }
    }));
    geoPosition.onValue(function(msg) {
      streams.treeData.push({
        id: 'navigation.position',
        value: [
          Number(msg.lon.substring(0, 3)) + Number(msg.lon.substring(3, msg.lon.length) / 60),
          Number(msg.lat.substring(0, 2)) + Number(msg.lat.substring(2, msg.lat.length) / 60),
        ],
        source: {
          type: 'nmea',
          id: '--',
          timestamp: new Date(),
          sentence: '--'
        }
      });
    });

    /*
     { type: 'wind',
     angle: '313',
     reference: 'T',
     speed: '08.16',
     units: 'N',
     status: 'A',
     talker_id: 'II' }
     */
    var wind = streams.nmea.json.filter(function (msg) {
      return msg.type === 'wind'
    });
    streams.gaugeData.plug(wind.map(function (msg) {
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
    streams.treeData.getTypeStream('environmental.apparentWindSpeed').plug(
      wind
        .filter(function(msg){
          return msg.reference === 'R';
        })
        .map(function(msg){
          return {
            id: 'environmental.apparentWindSpeed',
            value: navi.knots2MetersPerSecond(Number(msg.speed)),
            source: {
              type: 'nmea',
              id: '--',
              timestamp: new Date(),
              sentence: '--'
            }
          }
        })
    );
    streams.treeData.getTypeStream('environmental.apparentWindDirection').plug(
      wind
        .filter(function(msg){
          return msg.reference === 'R';
        })
        .map(function(msg){
          return {
            id: 'environmental.apparentWindDirection',
            value: Number(msg.angle),
            source: {
              type: 'nmea',
              id: '--',
              timestamp: new Date(),
              sentence: '--'
            }
          }
        })
    );
    streams.treeData.getTypeStream('environmental.apparentWindSpeed').plug(
      wind
        .filter(function(msg){
          return msg.reference === 'T';
        })
        .map(function(msg){
          return {
            id: 'environmental.trueWindSpeed',
            value: navi.knots2MetersPerSecond(Number(msg.speed)),
            source: {
              type: 'nmea',
              id: '--',
              timestamp: new Date(),
              sentence: '--'
            }
          }
        })
    );
    streams.treeData.getTypeStream('environmental.apparentWindDirection').plug(
      wind
        .filter(function(msg){
          return msg.reference === 'T';
        })
        .map(function(msg){
          return {
            id: 'environmental.trueWindDirection',
            value: Number(msg.angle),
            source: {
              type: 'nmea',
              id: '--',
              timestamp: new Date(),
              sentence: '--'
            }
          }
        })
    );



    var depthTransducer = streams.nmea.json.filter(function (msg) {
      return msg.type === 'depth-transducer'
    });
    streams.gaugeData.plug(depthTransducer.map(function (msg) {
      return {
        type: 'depth',
        depth: msg.depthMeters
      }
    }));
    streams.treeData.getTypeStream('navigation.depth').plug(depthTransducer.map(function(msg){
      return {
        id: 'navigation.depth',
        value: msg.depthMeters,
        source: {
          type: 'nmea',
          id: '--',
          timestamp: new Date(),
          sentence: '--'
        }
      }
    }));
  }
}

