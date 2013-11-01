var should = require('should');

describe('n2k messages are piped out', function () {
  var sources = require('../lib/sources.js');
  var sources = sources.configure(['--json', 'samples/n2k.json']);
  var allOut = [];
  var oneOut = [];
  var twoOut = [];
  sources.n2k.all.subscribe(function(d) {allOut.push(d.value())});
  sources.n2k.getTypeStream('1').subscribe(function(d){oneOut.push(d.value())});
  sources.n2k.getTypeStream('2').subscribe(function(d){twoOut.push(d.value())});
  sources.n2k.push({pgn: '1', data: 'somedata'});

  it('pipes out to all', function () {
    allOut.should.have.length(1);
    allOut[0].should.have.property('pgn', '1');
    allOut[0].should.have.property('data', 'somedata');
  });
  it('pipes to one', function () {
    oneOut.should.have.length(1);
    oneOut[0].should.have.property('pgn', '1');
    oneOut[0].should.have.property('data', 'somedata');
  });
  it("doesn't pipe to two", function () {
    twoOut.should.have.length(0);
  });
});