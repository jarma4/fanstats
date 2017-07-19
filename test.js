var mongoose = require('mongoose'),
   // fs = require('fs'),
   // request = require('request'),
   // exec = require('child_process').exec,
   // cheerio = require('cheerio'),
   // Promise = require('promise'),
   Scraper = require('./models/scraper'),
   // Players = require('./models/dbschema').Players,
   Managers = require('./models/dbschema').Managers;
   League = require('./models/dbschema').League;

mongoose.connect('mongodb://vcl:'+process.env.BAF_MONGO+'@127.0.0.1/vcl',{useMongoClient: true});

function scrape(year) {
   Managers.find({}, function(err, results){
      results.forEach(function(manager){
         for (var week=2;week<14;week++){
            Scraper.scrapeToDb(manager.num,week, year);
         }
      });
   });
}

for (var year=2016;year<2017;year++){
   scrape(year);
}

// below goes through players db and calculates score for each record
if (0) {
   Players.find({}, function(err, players) {
      players.forEach(function(rec){
         var score = (rec.r_yards||0)/10+(rec.p_yards||0)/10+(rec.r_tds||0)*6+(rec.p_tds||0)*6;
         console.log(rec.player+' '+score);
         Players.findByIdAndUpdate(rec._id, {points: score}, function(err, single){
            if (err)
               console.log('error');
         });
      });
   });
}

if(0) {
   for (var i = 7; i < 13; i++) {
      addPlayerRecord(i,'Brown, A','WR');
   }
}

function addPlayerRecord(week, player, position) {
   new Players({
      player : player,
      position : position,
      year: 2016,
      week : week,
      points: 0,
      r_yards: (position == 'RB')?40+Math.round(100*Math.random()):0,
      r_tds: (position == 'RB')?Math.round(3*Math.random()):0,
      p_yards: (position == 'WR')?40+Math.round(100*Math.random()):Math.round(30*Math.random()),
      p_tds: (position == 'WR')?Math.round(3*Math.random()):Math.round(0.75*Math.random())
   }).save();
   console.log('done');
}

// var url = 'http://www.oddsshark.com/nba/ats-standings';
// request(url, function (err, response, body) {
//    if(!err && response.statusCode === 200) {
//       var $ = cheerio.load(body);
//
//       var teams = ['Golden State','LA Clippers','San Antonio','Oklahoma City','Cleveland','Houston','Memphis','Atlanta','Chicago','New Orleans','Miami','Washington','Toronto','Milwaukee','Boston','Utah','Indiana','Phoenix','Detroit','Dallas','Sacramento','Orlando','Charlotte','New York','LA Lakers','Minnesota','Brooklyn','Portland','Denver','Philadelphia'];
//
//       teams.forEach(function(name){
//          var record = $('.base-table a:contains('+name+')').parent().next().text().split('-');
//          var newproj = Number(record[0])/(Number(record[0])+Number(record[1]))*82;
//          OUGame.findOne({team: name}, function(err, rec) {
//             OUGame.update({team: name}, {win: record[0], loss: record[1], projection: newproj, status: (newproj > rec.line)?'Over':'Under'}, function(err, resp){
//                if (err)
//                   console.log('error');
//                if (resp.n)
//                   console.log('updated '+name+' record');
//             });
//          });
//       });
//    }
// });
