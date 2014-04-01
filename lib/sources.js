var Bacon = require("baconjs").Bacon;
var nmeasource = require('./nmeasource.js');
var jsonsource = require('./jsonsource.js');
var n2ksource = require('./n2ksource.js');
var winston = require('winston');



function StreamBundle(name, extractTypeFunction) {
  this.all =  new Bacon.Bus();
  this.extractTypeFunction = extractTypeFunction;
  this.name = name;
};
StreamBundle.prototype = {
  getTypeStream: function (type) {
    if (this[type] === undefined) {
      this[type] = new Bacon.Bus();
    }
    return this[type];
  },
  push: function (msg) {
    this.all.push(msg);
    if (this.extractTypeFunction != undefined) {
      this.getTypeStream(this.extractTypeFunction(msg)).push(msg);
    }
  },
  subscribe: function (theFunction) {
    return this.all.subscribe(theFunction);
  },
  plug: function (x, type) {
    this.all.plug(x);
    if (this.extractTypeFunction != undefined) {
      this.getTypeStream(type).plug(x);
    }
  },
  createStreamWithConfiguration: function(configurationName, useNested) {
    var configurationFilename = './sourceconfiguration/' + this.name + '/' +
      configurationName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
      + '.js';
    winston.info('Reading source configuration from ' + configurationFilename + ' nested=' + useNested);
    var streamFromConfig = require(configurationFilename).createFromBundle(this);
    return  useNested
      ? streamFromConfig.map(this.toNested)
      : streamFromConfig;
  },
  toNested : function(msg) {
    var result = {};
    var temp = result;
    var parts = msg.id.split('.');
    for (var i=0; i < parts.length -1; i++) {
      temp[parts[i]] = {};
      temp = temp[parts[i]];
    }
    temp[parts[parts.length-1]] = msg;
    temp[parts[parts.length-1]].id = undefined;
    return result;
  }
}


exports.usages = function () {
  return require('optimist')
    .describe('n2k', 'actisense:/dev/USBxx|file:n2k.data[.gz]')
    .describe('nmea', '[gpspipe[:port]],[gpspipe:port],[file:nmea.data[.gz]] Read with gpspipe -r or from file (optionally gzipped)')
    .describe('json', '[file:filename.json] Read data from [filename] in "raw" object literal json format previously written by Naviserver')
    .usage('Example for real data from sensors: --nmea=gpspipe --n2k=/dev/actisense')
    .usage('Example for raw nmea/n2k data from file: --nmea=file:cassiopeia.nmea.data.gz --n2k=file:cassiopeia.n2k.data.gz')
    .usage('Example for json combined data: --json=file:cassiopeia.json.gz')
}

exports.configure = function (argv, hasActiveClients) {
  var sources = {
    n2k: new StreamBundle('n2k', function (msg) {
      return msg.pgn;
    }),
    nmea: {
      raw: new Bacon.Bus(),
      json: new Bacon.Bus()
    },
    gaugeData: new StreamBundle('gaugeData', function (msg) {
      return msg.type;
    }),
    treeData: new StreamBundle('treedata', function (msg) {
      return msg.id;
    })
  }

  if (argv.json) {
    jsonsource.create(getFilename(argv.json), sources.n2k, sources.nmea.json, hasActiveClients);
  }

  if (argv.n2k) {
    n2ksource.create(sources.n2k, argv.n2k);
  }

  if (argv.nmea) {
    nmeasource.create(sources.nmea.json, sources.nmea.raw, argv.nmea);
  }
  return sources;
};

function getFilename(fileargument) {
  var FILEPREFIX = 'file:';
  if (fileargument.indexOf('file:') === 0) {
    return fileargument.substr(FILEPREFIX.length, fileargument.length);
  }
  return fileargument;
}

