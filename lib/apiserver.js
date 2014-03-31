exports.registerHandlers = function(app) {

  var prefix = '/api/0.1/';
  app.get(prefix + 'vessels', function (request, response) {
    response.json([
      {
        name: 'Cassiopeia',
        modelHref: '../vessel/byName/cassiopeia/model',
        primusHref: '/?boat=cassiopeia&treedata=default'
      },
      {
        name: 'Freya',
        modelHref: '../vessel/byName/freya/model',
        primusHref: '/?boat=freya&treedata=default'
      },
      {
        name: 'Plaka',
        model: '../vessel/byName/plaka/model',
        primusHref: '/?boat=plaka&treedata=default'
      }
    ]);
  });

  app.get(prefix + 'vessel/byName/:name/model', function(request, response) {
    try {
      var sanitizedName = request.params.name.replace('.','_').replace('/','_').replace('\\','_');
      var boat = require('./boats/' + sanitizedName);
      response.json(boat.model);
    } catch (ex) {
      response.send(404);
    }
  });
}