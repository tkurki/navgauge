var Bacon = require("baconjs").Bacon;
var messages = require("../../webapp/lib/messages.js").messages;
var navi = require("../naviutils.js");
/**
 var sources = {
  n2k: new StreamBundle(function(msg){return msg.pgn;}),
  nmea: {
    raw: new Bacon.Bus(),
    json: new Bacon.Bus()
  },
  gaugeData: new StreamBundle()
}
 **/

exports.boat = {
  configureStreams: function (streams) {
    streams.gaugeData.plug(streams.n2k.getTypeStream(messages.POSITIONRAPIDUPDATE).
      filter(function (msg) {
        return msg.src === '1'
      }).map(function (msg) {
        return {
          type: 'position',
          lat: msg.fields.Latitude,
          lon: msg.fields.Longitude
        }
      })
    );

    streams.gaugeData.plug(streams.n2k.getTypeStream(messages.WATERDEPTH).map(function (msg) {
      return {
        type: 'depth',
        depth: Number(msg.fields.Depth)
      }
    }));
    streams.treeData.getTypeStream('navigation.depth').plug(streams.n2k.getTypeStream(messages.WATERDEPTH).map(function (msg) {
      return {
        id: 'navigation.depth',
        value: msg.fields.Depth,
        source: navi.n2kSource(msg)
      }
    }));

    var trueCogSog = streams.n2k.getTypeStream(messages.COGSOG).
      filter(function (msg) {
        return msg.fields['COG Reference'] === 'True'
      });
    streams.gaugeData.plug(trueCogSog.
      flatMap(function (msg) {
        return Bacon.fromArray([
          {
            type: 'course',
            heading: Number(msg.fields.COG)
          },
          {
            type: 'speed',
            knots: navi.metersPerSecond2knots(Number(msg.fields.SOG))
          }
        ]);
      })
    );
    trueCogSog.onValue(function(msg){
      streams.treeData.push({
        id: 'navigation.speedOverGround',
        value: navi.metersPerSecond2knots(Number(msg.fields.SOG)),
        source: navi.n2kSource(msg)
      });
      streams.treeData.push({
        id: 'navigation.headingNorth',
        value: Number(msg.fields.COG),
        source: navi.n2kSource(msg)
      });
    });

    streams.n2k.getTypeStream(messages.WIND).filter(function (msg) {
      return msg.src === '1' && msg.fields.Reference === 'True (boat referenced)';
    }).onValue(function(msg){
        streams.treeData.push({
          id: 'environmental.apparentWindSpeed',
          value: msg.fields['Wind Speed'],
          source: navi.n2kSource(msg)
        });
        streams.treeData.push({
          id: 'environmental.apparentWindDirection',
          value: msg.fields['Wind Angle'],
          source: navi.n2kSource(msg)
        });
      });

      streams.gaugeData.plug(streams.n2k.getTypeStream(messages.WIND).
      filter(function (msg) {
        console.log(msg);
        return msg.src === '1';
      }).map(function (msg) {
        switch (msg.fields.Reference) {
          case
          'True (boat referenced)':
            return {
              type: 'wind',
              reference: 'true boat',
              speed: msg.fields['Wind Speed'],
              angle: msg.fields['Wind Angle']
            };
            break;
          case 'Apparent':
            return {
              type: 'wind',
              reference: 'apparent',
              speed: Number(msg.fields['Wind Speed']),
              angle: Number(msg.fields['Wind Angle'])
            }
        }
      })
    );


    streams.gaugeData.plug(streams.n2k.getTypeStream(messages.NAVIGATIONDATA).
      flatMap(function (msg) {
        if (msg.fields["Bearing, Position to Destination Waypoint"] != undefined) {
          return Bacon.fromArray([{
            type: '2waypoint',
            bearing: Number(msg.fields["Bearing, Position to Destination Waypoint"]),
            distance: Number(msg.fields["Distance to Waypoint"]) / 1852,
            vmg: Number(msg.fields["Waypoint Closing Velocity"])
          }])
        } else {
          return Bacon.never
        }
      })
    );
  }
}



