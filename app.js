var express = require('express'),
   app = express(),
   compression = require('compression'),
   exec = require('child_process').exec,
   crontab = require('node-crontab'),
   routes = require('./routes/index'),
   scraper = require('./models/scraper'),
   api = require('./routes/api').router;

app.use(compression());
app.use('/', routes);
app.use('/api', api);
app.use('/', express.static(__dirname + '/public'));
app.set('view engine', 'pug');
app.set('views', './views');

var updateStats = crontab.scheduleJob("0 7 * * 2", scraper.weeklyStats,[2018, scraper.getWeek(new Date())]);
var backupDbCron = crontab.scheduleJob('0 10 * * 2', function () {
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
