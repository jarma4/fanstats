let mongoose = require('mongoose'),
   fs = require('fs'),
   request = require('request'),
   exec = require('child_process').exec,
   cheerio = require('cheerio'),
   // Promise = require('promise'),
   Scraper = require('./models/scraper'),
   Players = require('./models/dbschema').Players,
   Managers = require('./models/dbschema').Managers,
   League = require('./models/dbschema').League,
   Draft = require('./models/dbschema').Draft,
   Streak = require('./models/dbschema').Streak,
   Api = require('./routes/api');

var managers = [
   'sergio',
   'eric',   //out
   'ed',
   'kirk',
   'john',
   'tony',
   'gary',
   'haynos', //out
   'kevin',
   'ted',   //chuck out
   'brooks', //steven1, out
   'ryan',
   'aaron',
   'jason',
   'firdavs',
   'matt', //erik
   'steven',

];
require('dotenv').config();
mongoose.createConnection('mongodb://vcl:'+process.env.BAF_MONGO+'@127.0.0.1/vcl',{useMongoClient: true});

for (let week=10;week<14;week++){
   Scraper.weeklyStats(2018,week);
}

// scrapes for playoffs attendence
if (0){
   var target = 'http://games.espn.com/ffl/standings?leagueId=170051&seasonId='+season;
   var j = request.jar();
   var cookie = request.cookie('espnAuth={"swid":"{8B16EBB9-CBBA-48C9-8092-10FDEE6C2662}"}');
   j.setCookie(cookie,target);
   cookie = request.cookie('SWID={8B16EBB9-CBBA-48C9-8092-10FDEE6C2662}');
   j.setCookie(cookie,target);
   cookie = request.cookie('espn_s2=AEBxSaW9ycfd5NvriDQOIas67vT98OWcxOACfZgZF89obw%2B6kQYe%2B6o5X9U1X0qJ%2B7NtbcWvZz43rqEM3Yh8il%2F0NCDOXjk7E%2Bm7a%2FsjAGzeNbkBeCXeG6oahdxHeWYBy6nLRV3FH6%2F8%2Fx4yENSZzqLtNttJO%2Fy7EcysL6TgRnTZszUh%2FpPqn0uahbp%2BU7Lc4OrTeKaOio2AOlqYnccWgGAV4XhClP6BQ5RG0v0XMJwfnjvuSPsKvvDQ0MQa6qNfG9w%3D');
   j.setCookie(cookie,target);
   request({
      'url':target,
      'jar': j
   }, function (err, response, body) {
      if(!err && response.statusCode === 200) {
         let $ = cheerio.load(body);
         let txt, mgr, player, pick = 217;
         $('.games-pageheader').each(function(index){
            $(this).next().children().children().children().children().children().children().slice(2,(season<2014 || season==2016)?6:8).each(function(index){
               Streak.update({season: season, num: $(this).children().children('a').attr('href').split('&')[1].split('=')[1]},{playoffs: true}, (err)=>{
                  if(err)
                     console.log('Error updating record');
               });
            });
         });
      }
   });
}

function getManagers(season){
   return new Promise(function(resolve, reject){
      let tmp = (season != 'All')?season:2016;
      Managers.find({start:{$lte: tmp}, end:{$gte: tmp}}, {name: 1, num:1},  function(err, managers){
         resolve (managers);
      }).sort({name:1});
   });
}

// scrapes for record streaks
if(0) {
   getManagers(season).then((managers)=>{
      managers.forEach((manager)=>{
         var target = 'http://games.espn.com/ffl/schedule?leagueId=170051&seasonId='+season+'&teamId='+manager.num;
         var j = request.jar();
         var cookie = request.cookie('espnAuth={"swid":"{8B16EBB9-CBBA-48C9-8092-10FDEE6C2662}"}');
         j.setCookie(cookie,target);
         cookie = request.cookie('SWID={8B16EBB9-CBBA-48C9-8092-10FDEE6C2662}');
         j.setCookie(cookie,target);
         cookie = request.cookie('espn_s2=AEBxSaW9ycfd5NvriDQOIas67vT98OWcxOACfZgZF89obw%2B6kQYe%2B6o5X9U1X0qJ%2B7NtbcWvZz43rqEM3Yh8il%2F0NCDOXjk7E%2Bm7a%2FsjAGzeNbkBeCXeG6oahdxHeWYBy6nLRV3FH6%2F8%2Fx4yENSZzqLtNttJO%2Fy7EcysL6TgRnTZszUh%2FpPqn0uahbp%2BU7Lc4OrTeKaOio2AOlqYnccWgGAV4XhClP6BQ5RG0v0XMJwfnjvuSPsKvvDQ0MQa6qNfG9w%3D');
         j.setCookie(cookie,target);
         request({
            'url':target,
            'jar': j
         }, function (err, response, body) {
            if(!err && response.statusCode === 200) {
               let $ = cheerio.load(body);
               let txt, mgr, player, pick = 217;
                  // find table
                  $('.bodyCopy').each(function(){
                     let maxWin=0, maxLose=0, wlast=0, wtmp=0, llast=0, ltmp=0, type='start', startStreak;
                     // step through 13 weeks in table
                     $(this).next().children().children().next().next().slice(0,13).each(function(index){
                        let record = $(this).children().next().first().text().split('-');
                        // start streak check
                        if (type == 'start' && record[0] === '0')
                           type = 'lose';
                        else if (type == 'start')
                           type = 'win';
                        if ((type == 'win' && record[1] !== '0') || (type == 'lose' && record[0] !== '0')) {
                           startStreak = index;
                           if (type == 'lose')
                              startStreak = -startStreak;
                           type = 'done';
                        }

                        //check max win streak
                        if (Number(record[0]) > wlast)
                           ++wtmp;
                        else
                           wtmp = 0;
                        if (wtmp > maxWin)
                           maxWin = wtmp;
                        wlast = Number(record[0]);

                        // check max lose streak
                        if (Number(record[1]) > llast)
                           ++ltmp;
                        else
                           ltmp = 0;
                        if (ltmp > maxLose)
                           maxLose = ltmp;
                        llast = Number(record[1]);
                        // console.log(record[0]+'-'+record[1]+' maxWin:'+maxWin+' maxlose:'+maxLose);
                     });
                     new Streak({
                        season: season,
                        manager: manager.name,
                        num: manager.num,
                        start: startStreak,
                        longestWin: maxWin,
                        longestLose: maxLose
                     }).save(function(err){
                        if(err)
                           console.log('Trouble adding stat: '+err);
                     });
                     console.log(manager.name+' start:'+startStreak+' win:'+maxWin+' maxLose:'+maxLose);
                  });
               }
         });
      });
   });
}
// var changeYear = [2009,2011,2012,2018];
// var formats = {
//    2009: ['qb','rb1','rb2','wr1','wr2','wr3te','idp1','idp2','idp3','k'],
//    2011: ['qb','rb1','rb2','wr1','wr2','wr3te','dst','k'],
//    2012: ['qb','rb1','rb2','wr1','wr2','wr3te','idp1','idp2','idp3','k'],
//    2017: ['qb','rb1','rb2','wr1','wr2','wr3te','idp1','idp2','idp3','flex'],
// };
// var year = 2017, outp = '';
//
// formats[changeYear.reduce((store,yr)=>(yr<=year)?yr:store)].forEach(function(position){
//    outp += '<td>'+position.replace(/[0-9]/g, '').toUpperCase()+'</td>';
// });
// console.log(outp);

// var managers = {
//    MLRS : 'aaron',
//    Puff : 'kirk',
//    MCGE : 'john',
//    BD : 'tony',
//    JUCE : 'jason',
//    BEUB : 'ted',
//    "100%" : 'ryan',
//    ZIMM : 'ed',
//    SW : 'sergio',
//    Gbag : 'steven',
//    FP : 'firdavs',
//    GTW : 'erik',
//    CCCC : 'matt'
// };

// var target = 'http://games.espn.com/ffl/recentactivity?leagueId=170051&seasonId=2018&activityType=-1&startDate=20180826&endDate=20180826&teamId=-1&tranType=-2';
// var j = request.jar();
// var cookie = request.cookie('espnAuth={"swid":"{8B16EBB9-CBBA-48C9-8092-10FDEE6C2662}"}');
// j.setCookie(cookie,target);
// cookie = request.cookie('SWID={8B16EBB9-CBBA-48C9-8092-10FDEE6C2662}');
// j.setCookie(cookie,target);
// cookie = request.cookie('espn_s2=AEBxSaW9ycfd5NvriDQOIas67vT98OWcxOACfZgZF89obw%2B6kQYe%2B6o5X9U1X0qJ%2B7NtbcWvZz43rqEM3Yh8il%2F0NCDOXjk7E%2Bm7a%2FsjAGzeNbkBeCXeG6oahdxHeWYBy6nLRV3FH6%2F8%2Fx4yENSZzqLtNttJO%2Fy7EcysL6TgRnTZszUh%2FpPqn0uahbp%2BU7Lc4OrTeKaOio2AOlqYnccWgGAV4XhClP6BQ5RG0v0XMJwfnjvuSPsKvvDQ0MQa6qNfG9w%3D');
// j.setCookie(cookie,target);
// request({
//    'url':target,
//    'jar': j
//    }, function (err, response, body) {
//       if(!err && response.statusCode === 200) {
//          let $ = cheerio.load(body);
//          let txt, mgr, player, pick = 217;
//          $('td:contains("drafted")').each(function(index){
//             txt = $(this).text().split(',')[0].split(' ');
//             mgr = managers[txt[0]];
//             player = txt.splice(2).join().replace(/,/g,' ');
//             console.log(`Pick ${pick} ${mgr}*${player}*`);
//             Draft.findOneAndUpdate({season:2018, manager: mgr, player: player}, {pick: pick--}, function(err, rec){
//                if (err)
//                   console.log(err);
//                else {
//                   // console.log(`***found ${pick}`);
//                }
//             });
//          });
//          // console.log($(this).text());
//       }
// });

if(0) {
   for (let i = 7; i < 13; i++) {
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