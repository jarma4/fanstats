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
   Api = require('./routes/api');

mongoose.createConnection('mongodb://vcl:'+process.env.BAF_MONGO+'@127.0.0.1/vcl',{useMongoClient: true});
// var year = 2016;
// var target = 'http://games.espn.com/ffl/tools/draftrecap?leagueId=170051&seasonId='+year;
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
//       var managerNum = [];
//       if(!err && response.statusCode === 200) {
//          var $ = cheerio.load(body);
//          $('.tableHead a').each(function(index){
//             managerNum.push(Number($(this).attr('href').split('&')[1].split('=')[1]));
//                // let playerInfo = $(this).children().next().text();
//             // console.log($(this).find('a').attr('href').split('&')[1].split('=')[1]);
//             // $(this).find('.tableBody').each(function(index){
//             //    console.log($(this).children().next().text());
//             // });
//          });
//          $('.tableBody').each(function(index){
//             let playerInfo = $(this).children().next().text();
//             console.log(managers[managerNum[Math.floor(index / 18)]-1]);
//             // console.log(playerInfo.slice(0,playerInfo.indexOf(',')));
//          });
//          console.log(managerNum);
//       }
// });
for (var i = 2012; i < 2016; i++) {
   Scraper.scrapeDraft(i);
}
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
   'brooks', //steven, out
   'ryan',
   'aaron',
   'jason',
   'firdavs'
];
