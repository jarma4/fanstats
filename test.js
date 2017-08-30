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

Scraper.scrapeDraft(2012);
// var target = 'http://games.espn.com/ffl/tools/draftrecap?leagueId=170051&seasonId=2016';
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
//          var $ = cheerio.load(body);
//          $('.tableBody').each(function(index){
//             let playerInfo = $(this).children().next().text();
//             let name = playerInfo.slice(0,playerInfo.indexOf(','));
//             let position = playerInfo.slice(playerInfo.indexOf('$')-2,playerInfo.indexOf('$'));
//             if(position.slice(position.length-1) == '\xa0')
//                position = playerInfo.substr(playerInfo.indexOf('$')-4,2).trim();
//             else
//                position = position.trim();
//             let cost = playerInfo.slice(playerInfo.indexOf('$'));
//             // console.log(playerInfo);
//             console.log(name+' '+position+' '+cost);
//          });
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

// let url = 'http://www.oddsshark.com/nba/ats-standings';
// request(url, function (err, response, body) {
//    if(!err && response.statusCode === 200) {
//       let $ = cheerio.load(body);
//
//       let teams = ['Golden State','LA Clippers','San Antonio','Oklahoma City','Cleveland','Houston','Memphis','Atlanta','Chicago','New Orleans','Miami','Washington','Toronto','Milwaukee','Boston','Utah','Indiana','Phoenix','Detroit','Dallas','Sacramento','Orlando','Charlotte','New York','LA Lakers','Minnesota','Brooklyn','Portland','Denver','Philadelphia'];
//
//       teams.forEach(function(name){
//          let record = $('.base-table a:contains('+name+')').parent().next().text().split('-');
//          let newproj = Number(record[0])/(Number(record[0])+Number(record[1]))*82;
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
