#!/usr/bin/env node
'use strict';

var utils = require('./utils.js');
var udp = require('./udp.js');
var sources = require('./sources.js');
var jsonsource = require('./jsonsource.js');
var winston = require('winston');
var Bacon = require("baconjs").Bacon;



exports.startApp = function () {

  var optimist = sources.usages()
    .usage('$0: Http server and router for navigational data (NMEA 0183 & NMEA 2000)')
    .describe('u', 'Broadcast nmea 0183 via udp on port 7777')
    .describe('b', 'Broadcast address for udp broadcast')
    .describe('writejson', 'Write the internal json stream to [filename]')
    .describe('p', 'http port')
    .demand('boat')
    .describe('boat', 'boat configuration, loaded from lib/boats/ directory')
    .options('p', {default: 8080})
    .wrap(70);


  var argv = optimist.argv;

  if (argv.help) {
    optimist.showHelp();
    process.exit(0);
  }

  var express = require('express');
  var app = express();
  var path = require('path')

  var oneDay = 86400000;
  app.get("/swipe*", function(req,res) {
    res.sendfile(path.resolve(__dirname + '/../webapp/swipe.html'));
  });

  app.get('/api/0.1/vessels', function (request, response) {
    response.json([
      {
        name: 'Cassiopeia',
        href: '../vessel/byName/cassiopeia'
      },
      {
        name: 'Freya',
        href: '../vessel/byName/freya'
      },
      {
        name: 'Plaka',
        href: '../vessel/byName/plaka'
      }
    ]);
  });

  app.use(express.static(__dirname + '/../webapp/', { maxAge: oneDay }));
  var server = require('http').createServer(app);
  server.listen(Number(process.env.PORT || argv.p));

  var primus = new require('primus')(server, {
    parser: 'JSON'
  });


  var connectionEventsAsIntegers = new Bacon.Bus();
  var hasActiveClients = connectionEventsAsIntegers.scan(0, function(x,y){return x +y;}).map(function(v) { return v > 0;});


  var streamSources = sources.configure(argv, hasActiveClients);



  require('./boats/' + argv.boat + '.js').boat.configureStreams(streamSources);

  if (argv.u) {
    udp.create(streamSources.nmea.raw, argv);
  }

  if (argv.writejson) {
    jsonsource.startWriting(streamSources.nmea)
  }


  primus.on('connection', function (spark) {
    spark['unsubscribe'] = [];
    connectionEventsAsIntegers.push(1);
    winston.info('Connect:' + spark.id + " " + JSON.stringify(spark.query));
    var busData = true;
    if (spark.query['pgn'] != undefined) {
      [].concat(spark.query['pgn']).map(function (pgn) {
        var stream = streamconfig.out.pgn.pgnStream(pgn);
        spark['unsubscribe'].push(stream.subscribe(function (event) {
          spark.write(event.value());
        }))
      });
      busData = false;
    }
    if (spark.query['gaugedata'] != undefined) {
      spark['unsubscribe'].push(streamSources.gaugeData.subscribe(function (event) {
        spark.write(event.value());
      }));
      busData = false;
    }
    if (spark.query['treeData'] != undefined) {
      spark['unsubscribe'].push(streamSources.treeData.subscribe(function (event) {
        spark.write(event.value());
      }));
      busData = false;
    }
    if (busData) {
      spark['unsubscribe'].push(streamSources.n2k.subscribe(function (event) {
        spark.write(event.value());
      }));
      spark['unsubscribe'].push(streamSources.nmea.json.subscribe(function (event) {
        spark.write(event.value());
      }));
    }
  });

  primus.on('disconnection', function (spark) {
    connectionEventsAsIntegers.push(-1);
    winston.info("Disconnect:" + spark.id);
    spark['unsubscribe'].map(function (unsubscribeF) {
      unsubscribeF();
    });
  });

  return server;
}




