var http = require('http');
var should = require('should'); 
var assert = require('assert');
var request = require('supertest'); 

var app  = require(__dirname + '/../lib/naviserver.js');
process.argv = ['--json', '$DIR/../samples/cassiopeia.json.gz', '--boat', 'cassiopeia'];


var server;
describe('app', function () {
 
  before (function (done) {
    server = app.startApp();
    done();
  });

  after(function (done) {
    server.close();
    done();
  });

 
  it('should be listening at localhost:8080', function (done) {
    var headers = defaultGetOptions('/');
    http.get(headers, function (res) {
      res.statusCode.should.eql(200);
      done();
    });
  });

  it('vessel api returns list of vessels', function (done) {
  	request(server).get('/api/0.1/vessels')
  	.expect(200)
  	.expect('Content-Type', 'application/json; charset=utf-8')
  	  .end(function(err, res) {
        var result = res.body;
        assert.equal(result[0].name, 'Cassiopeia');
        done();
      })
  });

 
});

function defaultGetOptions(path) {
  var options = {
    "host": "localhost",
    "port": 8080,
    "path": path,
    "method": "GET",
  };
  return options;
}
