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
   Api = require('./routes/api');

require('dotenv').config();

// mongoose.createConnection('mongodb://vcl:'+process.env.BAF_MONGO+'@127.0.0.1/vcl',{useMongoClient: true});

// Scraper.scrapeDraft(2018);
Scraper.weeklyStats(2);
Scraper.weeklyStats(3);

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