var User = require('./server/models/User');

module.exports = function(app) {

  // Application ------------------------------------------
  app.get('/', function(req, res){
    res.sendfile('./index.html');
  });

  // Wildcard all other GET requests to the angular app
  app.get('*', function(req, res){
    res.sendfile('./index.html');
  });

};
