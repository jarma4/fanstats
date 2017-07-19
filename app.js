var express = require('express'),
   compression = require('compression');

var app = express();
var routes = require('./routes/index'),
   api = require('./routes/api');
app.use('/', routes);
app.use('/api', api);
app.use(compression());
app.use('/', express.static(__dirname + '/public'));
app.set('view engine', 'jade');
app.set('views', './views');

var server = app.listen(8082, function () {
   console.log('App listening at on port 8082');
});
