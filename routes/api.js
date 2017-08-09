var express = require('express'),
   bodyParser = require('body-parser'),
   Managers = require('../models/dbschema').Managers,
   Players = require('../models/dbschema').Players,
   League = require('../models/dbschema').League;
   // session = require('client-sessions'),
   // session = require('express-session'),
   mongoose = require('mongoose');

mongoose.connect('mongodb://vcl:'+process.env.BAF_MONGO+'@127.0.0.1/vcl',{useMongoClient: true});

router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));

router.post('/getmanagerstats', function(req,res){
   League.find({manager: req.body.manager, year: req.body.year},function(err,results){
      if (err)
         console.log(err);
      else {
         res.json(results);
      }
   }).sort({week:1});
});

router.post('/getmanagers', function(req,res){
   Managers.find({start:{$lte: req.body.year}, end:{$gte: req.body.year}}, {name: 1},  function(err, managers){
      res.json(managers);
   }).sort({name:1});
});

function weeklyHigh (yr, wk){
   return new Promise(function(resolve, reject) {
      League.find({week: wk, year: yr}, function(err, data){
         var mgr1, high = 0, mgr2, low = 200;
         data.forEach(function(manager) {
            if (manager.total > high) {
               high = manager.total;
               mgr1 = manager.manager;
            }
            if (manager.total < low) {
               low = manager.total;
               mgr2 = manager.manager;
            }
         });
         resolve ({high, mgr1, low, mgr2});
      });
   });
}

router.post('/getminmaxstats', function(req,res){
   var promises = [], highs = [], mgr1 = [], lows = [], mgr2 = [], weeks = [];
   for (i=0; i<13; i++) {
      promises.push(weeklyHigh(req.body.year, i+1));
      weeks.push(i+1);
   }
   Promise.all(promises).then(function(result){
      result.forEach(function(item){
         highs.push(item.high);
         mgr1.push(item.mgr1);
         lows.push(item.low);
         mgr2.push(item.mgr2);
      });
      res.send({highs: highs, mgr1: mgr1, lows: lows, mgr2: mgr2, weeks: weeks});
   });
});

router.post('/getleaguehistory', function(req,res){
   graphData(Number(req.body.start), Number(req.body.end), [[], [], [], [], [], []]).then(function (data){
      res.json(data);
   });
});

function yearlyTotals(year) {
   return new Promise(function (resolve, reject){
      var totalQb = 0,
      totalRb = 0,
      totalWr = 0,
      totalIdp = 0,
      totalK = 0,
      correction = 1;
      League.find({year: year}, function(err,data){
         if (err)
            reject(err);
         else {
            data.forEach(function(rec){
               totalQb += rec.qb;
               totalRb += rec.rb1 + rec.rb2;
               totalWr += rec.wr1 + rec.wr2 + rec.wr3te;
               totalIdp += ((year == 2011)?rec.dst:rec.idp1+rec.idp2+rec.idp3);
               totalK += rec.k;
            });
            // most years have 12 players, correct if 10
            if (data.length/13 == 10) {
               correction = 1.16667;
               year = year+'*';
            }
            resolve([year, totalQb*correction, totalRb*correction, totalWr*correction, totalIdp*correction, totalK*correction]);
         }
      }).sort({week:1});
   });
}

function graphData(year, end, dataArr) {
   return new Promise(function (resolve, reject){
      yearlyTotals(year).then(function(result){
         dataArr[5].push(result.pop());
         dataArr[4].push(result.pop());
         dataArr[3].push(result.pop());
         dataArr[2].push(result.pop());
         dataArr[1].push(result.pop());
         dataArr[0].push(result.pop());
         if (year < end) {
            graphData(year+1, end, dataArr).then(function(){
                resolve(dataArr);
            });
         } else {
            resolve();
         }
      });
   });
}

router.post('/getplayerstats', function(req,res){
   Players.find({$and: [{player: {$in: [req.body.player, req.body.player2, req.body.player3]}},
      (req.body.week)?{week: req.body.week}:{}]},function(err,stats){
         if (err)
         console.log(err);
         else {
            res.json(stats);
         }
      }).sort({week:1});
   });

router.post('/getplayers', function(req,res){
   Players.distinct('player', {position: req.body.position}, function(err,players){
      res.json(players);
   });
});

function getTotals(plr, yr){
   Stats.find({player: plr, year: yr},function(err,stat){
      var qb = 0,
      rb = 0,
      wr = 0,
      idp = 0,
      k = 0,
      total = 0;
      stat.forEach(function(week){
         qb += week.qb;
         rb += week.rb1 + week.rb2;
         wr += week.wr1 + week.wr2 + week.wr3te;
         idp += week.idp1 + week.idp2 + week.idp3;
         k += week.k;
         total += week.total;
      });
      console.log('QB='+qb+','+qb/total*100+', RB='+rb+','+rb/total*100+', WR='+wr+','+wr/total*100+', IDP='+idp+','+idp/total*100+', K='+k+','+k/total*100+', Total='+total);
   });
}

module.exports = router;
