let express = require('express'),
   bodyParser = require('body-parser'),
   Managers = require('../models/dbschema').Managers,
   Players = require('../models/dbschema').Players,
   League = require('../models/dbschema').League,
   Draft = require('../models/dbschema').Draft;
   // session = require('client-sessions'),
   // session = require('express-session'),
   mongoose = require('mongoose');

require('dotenv').config();

mongoose.connect('mongodb://vcl:'+process.env.BAF_MONGO+'@127.0.0.1/vcl',{useMongoClient: true});

router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));

router.post('/getmanagerstats', function(req,res){
   League.find({manager: req.body.manager, season: req.body.season},function(err,results){
      if (err)
         console.log(err);
      else {
         res.json(results);
      }
   }).sort({week:1});
});

router.post('/getdraft', function(req,res){
   if(req.body.manager == 'all') {
      Draft.find({season: req.body.season},function(err,results){
         if (err)
            console.log(err);
         else {
            res.json(results);
         }
      }).sort((req.body.sort == 1)?{position:1, cost:-1}:(req.body.sort == 2)?{cost:-1}:(req.body.sort == 3)?{pick: 1}:{manager:1, cost:-1});
   } else {
      var promises = [];
      getManagers(req.body.season).then(function(managers){
         managers.forEach(function(manager){
            promises.push(getTop5(manager.name, req.body.season));
         });
         Promise.all(promises).then(function(results){
            res.send(results);
         });
      });
   }
});

function getTop5 (manager, season){
   return new Promise(function(resolve, reject){
      Draft.find({season: season, manager: manager},function(err,results){
         if (err)
            console.log(err);
         else {
            resolve(results);
         }
      }).sort({cost:-1}).limit(5);
   });
}

function getManagers(season){
   return new Promise(function(resolve, reject){
      let tmp = (season != 'All')?season:2016;
      Managers.find({start:{$lte: tmp}, end:{$gte: tmp}}, {name: 1},  function(err, managers){
         resolve (managers);
      }).sort({name:1});
   });
}
router.post('/getmanagers', function(req,res){
   getManagers(req.body.season).then(function(results){
      res.send(results);
   });
});

router.post('/getleaguehistory', function(req,res){
   graphData(req.body.manager, Number(req.body.start), Number(req.body.end), [[], [], [], [], [], []]).then(function (data){
      res.json(data);
   });
});

function weeklyMinMax (yr, wk){
   return new Promise(function(resolve, reject) {
      League.find({week: wk, season: yr}, function(err, data){
         let high_manager, high = 0, low_manager, low = 300, avg = 0;
         data.forEach(function(manager) {
            if (manager.total > high) {
               high = manager.total;
               high_manager = manager.manager;
            }
            if (manager.total < low) {
               low = manager.total;
               low_manager = manager.manager;
            }
            avg += manager.total;
         });
         avg = avg / data.length;
         resolve ({high, high_manager, low, low_manager, avg});
      });
   });
}

router.post('/getminmaxyear', function(req,res){
   yearlyMinMax(req.body.season).then(function(data){
      res.send(data);
   });
});

function yearlyMinMax(season){
   return new Promise(function(resolve, reject){
      let promises = [], highs = [], high_managers = [], lows = [], low_managers = [], avgs = [], weeks = [];
      for (i=0; i<13; i++) {
         promises.push(weeklyMinMax(season, i+1));
         weeks.push(i+1);  // week numbers that match minmax scores
      }
      Promise.all(promises).then(function(result){
         result.forEach(function(week){
            highs.push(week.high);
            high_managers.push(week.high_manager);
            lows.push(week.low);
            low_managers.push(week.low_manager);
            avgs.push(week.avg);
         });
         resolve({highs, high_managers, lows, low_managers, avgs, weeks});  // returns 13 weeks of minmax scorers
      });
   });
}

router.get('/getminmaxall', function(req,res){
   let promises = [], highs = [], high_managers = [], lows = [], low_managers = [], avgs = [], years = [];

   for (let i = 2009; i < 2017; i++) {
      promises.push(yearlyMinMax(i));
      years.push(i);
   }

   Promise.all(promises).then(function(results){
      results.forEach(function(season, idx){
         let max = Math.max(...season.highs);
         highs.push(max);
         high_managers.push(season.high_managers[season.highs.indexOf(max)]);
         let min = Math.min(...season.lows);
         lows.push(min);
         low_managers.push(season.low_managers[season.lows.indexOf(min)]);
      });
      res.json ({highs, high_managers, lows, low_managers, years});
   });
});

function yearlyTotals(mgr, season) {
   return new Promise(function (resolve, reject){
      let totalQb = 0,
      totalRb = 0,
      totalWr = 0,
      totalIdp = 0,
      totalK = 0,
      correction = 1,
      query = {season: season};
      if (mgr != 'all') {
         query.manager = mgr;
      }
      League.find(query, function(err,data){
         if (err)
            reject(err);
         else {
            data.forEach(function(rec){
               totalQb += rec.qb;
               totalRb += rec.rb1 + rec.rb2;
               totalWr += rec.wr1 + rec.wr2 + rec.wr3te;
               totalIdp += ((season == 2011)?rec.dst:rec.idp1+rec.idp2+rec.idp3);
               totalK += rec.k;
            });
            // most years have 12 players, correct if 10
            if (data.length/13 == 10) {
               correction = 1.16667;
               season = season+'*';
            }
            resolve([season, totalQb*correction, totalRb*correction, totalWr*correction, totalIdp*correction, totalK*correction]);
         }
      }).sort({week:1});
   });
}

function graphData(manager, season, end, dataArr) {
   return new Promise(function (resolve, reject){
      yearlyTotals(manager, season).then(function(result){
         dataArr[5].push(result.pop());
         dataArr[4].push(result.pop());
         dataArr[3].push(result.pop());
         dataArr[2].push(result.pop());
         dataArr[1].push(result.pop());
         dataArr[0].push(result.pop());
         if (season < end) {
            graphData(manager, season+1, end, dataArr).then(function(){
                resolve(dataArr);
            });
         } else {
            resolve();
         }
      });
   });
}

function yearlyManagerTotal (mgr, yr){
   return new Promise (function(resolve, reject){
      League.find({manager:mgr,season:yr}, function(err, records){
         let yearlytotal = 0;
         if (err)
            console.log(err);
         else
            records.forEach(function(record, idx){
               yearlytotal += record.total;
            });
            resolve(yearlytotal);
      });
   });
}

function managerAvg(manager){
   return new Promise(function(resolve, reject){
      let promises = [], alltimetotal = 0;
      for (let season = manager.start; season < ((manager.end==9999)?2017:manager.end+1); season++) {
         promises.push(yearlyManagerTotal(manager.name, season));
      }
      Promise.all(promises).then(function(results){
         results.forEach(function(record){
            alltimetotal += record;
         });
         resolve({manager: manager.name, total : alltimetotal, years: results.length});
      });
   });
}

router.get('/getmanagertotals', function(req,res){
   let promises = [], data = [];
   Managers.find({}, function(err, records){
      records.forEach(function(manager){
         promises.push(managerAvg(manager));
      });
      Promise.all(promises).then(function(results){
         res.send(results);
      });
   });
});

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
   Stats.find({player: plr, season: yr},function(err,stat){
      let qb = 0,
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

module.exports = {
   router: router
};
