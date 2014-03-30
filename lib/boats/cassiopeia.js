var Bacon = require("baconjs").Bacon;
var n2kMessages = require("../../webapp/lib/messages.js").messages;
var navi = require('../naviutils.js');


exports.model = {
  dataItems : [
    'navigation.headingNorth'
  ]
}


exports.boat = {
  configureStreams: function (streams) {
    streams.gaugeData.plug(streams.n2k.getTypeStream(n2kMessages.WATERDEPTH).map(function (msg) {
      return {
        type: 'depth',
        depth: msg.fields.Depth
      }
    }), 'depth');
    streams.treeData.getTypeStream('navigation.depth').plug(streams.n2k.getTypeStream(n2kMessages.WATERDEPTH).map(function (msg) {
      return {
        id: 'navigation.depth',
        value: msg.fields.Depth,
        source: {
          type: 'n2k',
          id: 'ngt1',
          src: msg.src,
          pgn: msg.pgn,
          timestamp: navi.fromN2KDate(msg.timestamp)
        }
      }
    }), 'depth');
    /* { type: 'nav-info',
     timestamp: '065335.00',
     status: 'valid',
     lat: '6008.634',
     latPole: 'N',
     lon: '02453.922',
     lonPole: 'E',
     speedKnots: 5.9,
     trackTrue: 163.4,
     date: '220913',
     variation: 8.1,
     variationPole: 'E',
     talker_id: 'II' }*/
    streams.gaugeData.plug(streams.nmea.json.filter(function (msg) {
      return msg.type === 'nav-info'
    }).flatMap(function (msg) {
        return Bacon.fromArray([
          {
            type: 'course',
            heading: msg.trackTrue},
          {
            type: 'speed',
            knots: msg.speedKnots
          },
          {
            type: 'position',
            lat: Number(msg.lat.substring(0, 2)) + Number(msg.lat.substring(2, msg.lat.length) / 60),
            lon: Number(msg.lon.substring(0, 3)) + Number(msg.lon.substring(3, msg.lon.length) / 60)
          }
        ]);
      }));
    streams.nmea.json.filter(function (msg) {
      return msg.type === 'nav-info'
    }).onValue(function (msg) {
        streams.treeData.push({
          id : 'navigation.headingNorth',
          value: msg.trackTrue,
          source: {
            type: 'nmea',
            id: 'Seiwa',
            timestamp: new Date(),
            sentence: 'RMC'
          }
        });
        streams.treeData.push({
          id: 'navigation.speedOverGround',
          value: msg.speedKnots,
          source: {
            type: 'nmea',
            id: 'Seiwa',
            timestamp: new Date(),
            sentence: 'RMC'
          }
        });
        streams.treeData.push({
          id: 'navigation.position',
          value: [
            Number(msg.lon.substring(0, 3)) + Number(msg.lon.substring(3, msg.lon.length) / 60),
            Number(msg.lat.substring(0, 2)) + Number(msg.lat.substring(2, msg.lat.length) / 60),
          ],
          source: {
            type: 'nmea',
            id: 'Seiwa',
            timestamp: new Date(),
            sentence: 'RMC'
          }
        });
      });

    streams.gaugeData.plug(streams.nmea.json.filter(
      function (msg) {
        return msg.type === '2waypoint'
      }).map(function (msg) {
        return  {
          type: '2waypoint',
          bearing: Number(msg.bearingtrue),
          distance: Number(msg.distance),
          vmg: Number(0)
        };
      })
    );


    var apparentWind = streams.n2k.getTypeStream(n2kMessages.WIND).map(
      function (n2k) {
        return {
          type: 'wind',
          reference: 'apparent',
          angle: n2k.fields['Wind Angle'],
          speed: n2k.fields['Wind Speed']
        }
      });
    streams.gaugeData.plug(apparentWind);
    streams.n2k.getTypeStream(n2kMessages.WIND).onValue(
      function(n2k) {
        streams.treeData.push({
            id: 'environmental.apparentWindSpeed',
            value: n2k.fields['Wind Speed'],
            source: {
              type: 'n2k',
              id: 'ngt1',
              src: n2k.src,
              pgn: n2k.pgn,
              timestamp: navi.fromN2KDate(n2k.timestamp)
            }
          });
        streams.treeData.push({
            id: 'environmental.apparentWindDirection',
            value: n2k.fields['Wind Angle'],
            source: {
              type: 'n2k',
              id: 'ngt1',
              src: n2k.src,
              pgn: n2k.pgn,
              timestamp: navi.fromN2KDate(n2k.timestamp)
            }
          });
      }
    );
    var sogKnots = streams.nmea.json.filter(function (n) {
      return n.type == 'nav-info'
    }).map('.speedKnots');
    streams.gaugeData.plug(sogKnots.combine(apparentWind, function (sogInKnots, awInfo) {
      return {
        type: 'wind',
        reference: 'true boat',
        speed: navi.getTrueWindSpeed(navi.knots2MetersPerSecond(sogInKnots), awInfo.speed, awInfo.angle),
        angle: navi.getTrueWindAngle(navi.knots2MetersPerSecond(sogInKnots), awInfo.speed, awInfo.angle)
      };
    }));
  }
}


