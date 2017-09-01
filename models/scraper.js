var request = require('request'),
   cheerio = require('cheerio'),
   fs = require('fs'),
   // Managers = require('./dbschema').Managers,
   // Players = require('./dbschema').Players,
   League = require('./dbschema').League,
   Draft = require('./dbschema').Draft,
   mongoose = require('mongoose');

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

module.exports = {
   scrapeToDb: function (manager,wk,yr) {
   	var target = 'http://games.espn.com/ffl/boxscorequick?leagueId=170051&teamId='+(manager)+'&scoringPeriodId='+wk+'&seasonId='+yr+'&view=scoringperiod&version=quick';
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
   				var $ = cheerio.load(body);
               if (yr < 2016) {
                  var rb = 0,
                  wr = 0,
                  idp = 0;
                  var league = new League({
                     year: yr,
      					week: wk,
      					manager: managers[manager-1],
                  });
                  $('.playertablePlayerName').each(function(index){
                     if (index < 10) {
                        switch ($(this).text().substr($(this).text().length-2).trim()) {
                           case 'QB':
                              league.qb = $(this).next().next().next().text();
                              break;
                           case 'RB':
                              if(rb)
                                 league.rb2 = $(this).next().next().next().text();
                              else {
                                 league.rb1 = $(this).next().next().next().text();
                                 rb += 1;
                              }
                              break;
                           case 'WR':
                           case 'TE':
                              if (wr > 1)
                                 league.wr3te = $(this).next().next().next().text();
                              else if (wr > 0) {
                                 league.wr2 = $(this).next().next().next().text();
                                 wr += 1;
                              } else {
                                 league.wr1 = $(this).next().next().next().text();
                                 wr += 1;
                              }
                              break;
                           case 'LB':
                           case 'CB':
                           case 'DE':
                           case 'DT':
                           case 'S':
                              if (idp > 1)
                                 league.idp3 = $(this).next().next().next().text();
                              else if (idp > 0) {
                                 league.idp2 = $(this).next().next().next().text();
                                 idp += 1;
                              } else {
                                 league.idp1 = $(this).next().next().next().text();
                                 idp += 1;
                              }
                              break;
                              case 'ST':
                                 league.dst = $(this).next().next().next().text();
                                 break;
                              case 'K':
                              league.k = $(this).next().next().next().text();
                              // league.total = $(this).parent().next().children().next().next().text();
                              break;
                        }
                     } else {
                        return false;
                     }
                  });
                  league.total = $('.playerTableBgRowTotals').first().children().next().text();
                  // console.log(league);
                  league.save (function(err){
                     if (err)
                        console.log('Error saving: '+err);
                     else {
                        console.log('Record saved');
                     }
                  });
               } else {
      				var start = $('.slot_0');
      				new League ({
      					year: yr,
      					week: wk,
      					manager: managers[manager-1],
      					qb: start.first().next().next().next().next().text(),
      					rb1: start.first().parent().next().children().next().next().next().next().text(),
      					rb2: start.first().parent().next().next().children().next().next().next().next().text(),
      					wr1: start.first().parent().next().next().next().children().next().next().next().next().text(),
      					wr2: start.first().parent().next().next().next().next().children().next().next().next().next().text(),
      					wr3te: start.first().parent().next().next().next().next().next().children().next().next().next().next().text(),
      					idp1: start.first().parent().next().next().next().next().next().next().children().next().next().next().next().text(),
      					idp2: start.first().parent().next().next().next().next().next().next().next().children().next().next().next().next().text(),
      					idp3: (start.first().parent().next().next().next().next().next().next().next().next().children().next().next().next().next().text()=='--'?0:start.first().parent().next().next().next().next().next().next().next().next().children().next().next().next().next().text()),
      					k: start.first().parent().next().next().next().next().next().next().next().next().next().children().next().next().next().next().text(),
      					total: $('.totalScore').first().text()
   		         }).save(function(err){
      				 if(err)
      					 console.log('Trouble adding stat: '+err);
   		 	        });
              }
           }
      });
   },
   scrapeDraft: function(year){
      var target = 'http://games.espn.com/ffl/tools/draftrecap?leagueId=170051&seasonId='+year;
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
               var $ = cheerio.load(body);
               var managerNum = [];
               // first find all manager via number in href
               $('.tableHead a').each(function(index){
                  managerNum.push(Number($(this).attr('href').split('&')[1].split('=')[1]));
               });
               // next find all picks and save to db
               $('.tableBody').each(function(index){
                  let playerInfo = $(this).children().next().text();
                  let position = playerInfo.slice(playerInfo.indexOf('$')-2,playerInfo.indexOf('$'));
                  if(position.slice(position.length-1) == '\xa0')
                     position = playerInfo.substr(playerInfo.indexOf('$')-4,2).trim();
                  else
                     position = position.trim();
                  new Draft ({
                     manager: managers[managerNum[Math.floor(index / 18)]-1],
                     player: playerInfo.slice(0,playerInfo.indexOf(',')),
                     position: position,
                     cost: playerInfo.slice(playerInfo.indexOf('$')+1),
                     year: year
                  }).save(function(err){
                     if(err)
                        console.log('Trouble adding draft item: '+err);
                  });
               });
            }
      });
   }
};
