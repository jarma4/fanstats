var express = require('express'),
   app = express(),
   compression = require('compression'),
   exec = require('child_process').exec,
   crontab = require('node-crontab'),
   routes = require('./routes/index'),
   api = require('./routes/api');
   
app.use(compression());
app.use('/', routes);
app.use('/api', api);
app.use('/', express.static(__dirname + '/public'));
app.set('view engine', 'pug');
app.set('views', './views');

var backupDbCron = crontab.scheduleJob('0 1 * * 6', function () {
   var now = new Date();
   var cmd = exec('mongodump -dvcl -uvcl -p$BAF_MONGO -o backup/databases/'+now.getFullYear()+'_'+(now.getMonth()+1)+'_'+now.getDate(), function(error, stdout, stderr) {
      if (error || stderr) {
         console.log(error);
         console.log(stderr);
      }
   });
   console.log('DB backup - '+now);
});

var server = app.listen(8082, function () {
   console.log('App listening at on port 8082');
});
