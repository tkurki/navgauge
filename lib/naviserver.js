#!/usr/bin/env node
'use strict';

var Bacon = require("baconjs").Bacon;
var utils = require('./utils.js');
var udp = require('./udp.js');
var sources = require('./sources.js');
var jsonsource = require('./jsonsource.js');
var winston = require('winston');



exports.startApp = function () {

  var optimist = sources.usages()
    .usage('$0: Http server and router for navigational data (NMEA 0183 & NMEA 2000)')
    .describe('u', 'Broadcast nmea 0183 via udp on port 7777')
    .describe('b', 'Broadcast address for udp broadcast')
    .describe('writejson', 'Write the internal json stream to [filename]')
    .describe('p', 'http port')
    .demand('boat')
    .describe('boat', 'boat configuration, loaded from boats/ directory')
    .options('p', {default: 8080})
    .wrap(70);


  var argv = optimist.argv;

  if (argv.help) {
    optimist.showHelp();
    process.exit(0);
  }

  var server = require('http').createServer(function (request, response) {
    request.addListener('end',function () {
      new (require('node-static')).Server(__dirname + '/../webapp/').serve(request, response);
    }).resume();
  });
  server.listen(argv.p);

  var primus = new require('primus')(server, {
    parser: 'JSON'
  });


  var streamSources = sources.configure(argv);

  require('./boats/' + argv.boat + '.js').boat.configureStreams(streamSources);

  if (argv.u) {
    udp.create(streamSources.nmea.raw, argv);
  }

  if (argv.writejson) {
    jsonsource.startWriting(streamSources.nmea)
  }


  primus.on('connection', function (spark) {
      spark['unsubscribe'] = [];
      winston.info('Connect:' + JSON.stringify(spark.query));
      if (spark.query['pgn'] != undefined) {
        [].concat(spark.query['pgn']).map(function (pgn) {
          var stream = streamconfig.out.pgn.pgnStream(pgn);
          spark['unsubscribe'].push(stream.subscribe(function (event) {
            spark.write(event.value());
          }))
        });
      } else if (spark.query['gaugedata'] != undefined) {
        spark['unsubscribe'].push(streamSources.gaugeData.subscribe(function (event) {
          spark.write(event.value());
        }));
      } else {
        spark['unsubscribe'].push(streamSources.n2k.subscribe(function (event) {
          spark.write(event.value());
        }));
        spark['unsubscribe'].push(streamSources.nmea.json.subscribe(function (event) {
          spark.write(event.value());
        }));
      }

    }
  )
  ;

  primus.on('disconnection', function (spark) {
    spark['unsubscribe'].map(function (unsubscribeF) {
      unsubscribeF();
    });
  });
}




