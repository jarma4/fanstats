// "use strict"
$('#getStats').on('click', function () {
   event.preventDefault();
   if ($('input[name="statRadio"]:checked').val() == 1) {  // Points data
      if ($('#yearList').val() != 'All'){
         if ($('input[name="managerRadio"]:checked').val() == 1) {
            displayManagerYear();
         } else {
            displayLeagueYear();
         }
      } else {
         displayAll();
      }
   } else {  // Highs/Lows
      if ($('#yearList').val() == 'All'){
         displayMinmaxAll();
      } else {
         displayMinmax();
      }
   }
});

function managerTotals(data) {
   var outp = '',
   totalQb = 0,
   totalRb = 0,
   totalWr = 0,
   totalIdp = 0,
   totalK = 0,
   totalTotal = 0,
   chartTotals = [],
   chartAverage = [],
   chartWeeks = [];
   $.each(data, function(i,rec){
      // process data to get totals
      totalQb += rec.qb;
      totalRb += rec.rb1 + rec.rb2;
      totalWr += rec.wr1 + rec.wr2 + rec.wr3te;
      totalIdp += ((rec.year == 2011)?rec.dst:rec.idp1 + rec.idp2 + rec.idp3);
      totalK += rec.k;
      totalTotal += rec.total;
      // store weekly data in array to chart later
      chartWeeks.push(rec.week);
      chartTotals.push(rec.total);
      // starting week 3, create running 3 week average
      chartAverage.push((i > 1)?(chartTotals[i]+chartTotals[i-1]+chartTotals[i-2])/3:null);
      // go ahead and store table rows for each week although not used when showing league
      outp += '<tr class="small"><td>'+rec.week+'</td><td>'+rec.qb+'</td><td>'+rec.rb1+'</td><td>'+rec.rb2+'</td><td>'+rec.wr1+'</td><td>'+rec.wr2+'</td><td>'+rec.wr3te+'</td><td>'+rec.idp1+'</td><td>'+rec.idp2+'</td><td>'+rec.idp3+'</td><td>'+rec.k+'</td><td>'+rec.total+'</td></tr>';
   });
   return {
      totalQb: totalQb,
      totalRb: totalRb,
      totalWr: totalWr,
      totalIdp: totalIdp,
      totalK: totalK,
      totalTotal: totalTotal,
      chartTotals: chartTotals,
      chartAverage: chartAverage,
      chartWeeks: chartWeeks,
      outp: outp
   };
}

function displayManagerYear(){
   $.ajax({
      type: 'POST',
      url: '/api/getmanagerstats',
      data: {
         'manager': $('#managerList').val(),
         'year': $('#yearList').val()
      },
      success:function(retData){
         $('#dataHeading1').text('Manager: '+$('#managerList').val());
         $('#dataHeading2').text('Year: '+$('#yearList').val());
         // create first table with weekly totals for single manager
         var outp = '<table class="table table-sm table-striped"><tr class="small"><th>Wk</th><th>QB</th><th>RB1</th><th>RB2</th><th>WR1</th><th>WR2</th><th>WR3TE</th><th>IDP1</th><th>IDP2</th><th>IDP3</th><th>K</th><th>Total</th></tr>';
         var totals = managerTotals(retData);
         outp += totals.outp + '</table>';
         // second table with positional totals for single manager
         outp += '<table class="table table-sm"><tr class="small"><th>Total QB</th><th>Total RB</th><th>Total WR</th><th>Total IDP</th><th>Total K</th><th>Total</th></tr>';
         outp += '<tr class="small"><td>'+totals.totalQb.toPrecision(4)+' ('+(totals.totalQb/totals.totalTotal*100).toPrecision(3)+'%)</td><td>'+totals.totalRb.toPrecision(4)+' ('+(totals.totalRb/totals.totalTotal*100).toPrecision(3)+'%)</td><td>'+totals.totalWr.toPrecision(4)+' ('+(totals.totalWr/totals.totalTotal*100).toPrecision(3)+'%)</td><td>'+totals.totalIdp.toPrecision(4)+' ('+(totals.totalIdp/totals.totalTotal*100).toPrecision(3)+'%)</td><td>'+totals.totalK.toPrecision(4)+' ('+(totals.totalK/totals.totalTotal*100).toPrecision(3)+'%)</td><td>'+totals.totalTotal.toPrecision(5)+'</td></tr>';
         document.getElementById("resultsArea").innerHTML = outp;
         // setup chart data
         var ydata = [{
               label: 'Total Points',
               type: 'line',
               borderColor: '#244363',
               data: totals.chartTotals,
               yAxisID: 'left'
            },
            {
               label: '3week Avg',
               type: 'line',
               borderDash: [10, 5],
               borderColor: 'white',
               data: totals.chartAverage,
               yAxisID: 'left'
         }];
         // drawChart(1, totals.chartWeeks, ydata, null, true);
         drawChart('line-zero', totals.chartWeeks, ydata);
      },
      error: function(retData){
         console.log('Error getting stats');
      }
   });
}

function displayLeagueYear(){
   var leagueQb = 0,
   leagueRb = 0,
   leagueWr = 0,
   leagueIdp = 0,
   leagueK = 0,
   leagueTotal = 0;
   $('#dataHeading1').text('League Totals');
   $('#dataHeading2').text('Year: '+$('#yearList').val());
   // create table and display, manager rows added later
   var outp = '<table id="leagueTable" class="table table-sm table-striped table-bordered"><tr class="small"><th>Who</th><th onclick="sortTable(leagueTable, 1)">Total QB</th><th onclick="sortTable(leagueTable, 2)">Total RB</th><th onclick="sortTable(leagueTable, 3)">Total WR</th><th onclick="sortTable(leagueTable, 4)">Total IDP</th><th onclick="sortTable(leagueTable, 5)">Total K</th><th onclick="sortTable(leagueTable, 6)">Total</th></tr></table>';
   document.getElementById("resultsArea").innerHTML = outp;
   var promises = [];
   // get totals for each manager
   $.each ($('#managerList option'), function(managernum){
      var manager = $(this).val();
      var tmp = new Promise(function(resolve, reject){
         $.ajax({
            type: 'POST',
            url: '/api/getmanagerstats',
            asynchronous: false,
            data: {
               'manager': manager,
               'year': $('#yearList').val()
            },
            success:function(retData){
               // get totals for manager
               var totals = managerTotals(retData);
               if (totals.totalQb) {   // make sure data exists
                  $('#leagueTable tr:last').after('<tr class="small"><td>'+manager+'</td><td>'+totals.totalQb.toPrecision(4)+'</td><td>'+totals.totalRb.toPrecision(4)+'</td><td>'+totals.totalWr.toPrecision(4)+'</td><td>'+totals.totalIdp.toPrecision(4)+'</td><td>'+totals.totalK.toPrecision(4)+'</td><td>'+totals.totalTotal.toPrecision(4)+'</td></tr>');
                  leagueQb += totals.totalQb;
                  leagueRb += totals.totalRb;
                  leagueWr += totals.totalWr;
                  leagueIdp += totals.totalIdp;
                  leagueK += totals.totalK;
                  leagueTotal += totals.totalTotal;
               }
               resolve();
            },
            error: function(retData){
               console.log('trouble');
               reject();
            }
         });
      });
      promises.push(tmp);
   });
   $.when.apply(undefined, promises).done(function(){
      sortTable(leagueTable, 4);
      $('#leagueTable tr:last').after('<tr class="table-danger small"><td>League</td><td>'+leagueQb.toPrecision(4)+' ('+(leagueQb/leagueTotal*100).toPrecision(3)+'%)</td><td>'+leagueRb.toPrecision(4)+' ('+(leagueRb/leagueTotal*100).toPrecision(3)+'%)</td><td>'+leagueWr.toPrecision(4)+' ('+(leagueWr/leagueTotal*100).toPrecision(3)+'%)</td><td>'+leagueIdp.toPrecision(4)+' ('+(leagueIdp/leagueTotal*100).toPrecision(3)+'%)</td><td>'+leagueK.toPrecision(4)+' ('+(leagueK/leagueTotal*100).toPrecision(3)+'%)</td><td>'+leagueTotal.toPrecision(5)+'</td></tr>');
      var ydata = [{
         label: 'Position Totals',
         type: 'pie',
         backgroundColor: chartColors,
         data: [leagueQb, leagueRb, leagueWr, leagueIdp, leagueK],
         yAxisID: 'left'
      }];
      drawChart('pie', ['QB', 'RB', 'WR', 'IDP', 'K'], ydata);
   });
}

function displayAll (){
   $.ajax({
		type: 'POST',
		url: '/api/getleaguehistory',
      data: {
         'manager': ($('input[name="managerRadio"]:checked').val() == 1)?$('#managerList').val():'all',
         'start': 2012,
         'end': 2016,
         // 'year': $('#yearList').val()
      },
		success:function(retData){
         var correctionFlag = 0;
         var outp = '<table class="table table-sm"><tr class="small"><th>Year</th><th>Total QB</th><th>Total RB</th><th>Total WR</th><th>Total IDP</th><th>Total K</th></tr>';
         retData[0].forEach(function(year, inc){
            outp += '<tr class="small"><td>'+retData[0][inc]+'</td><td> '+Math.round(retData[1][inc])+'</td><td>'+Math.round(retData[2][inc])+'</td><td>'+Math.round(retData[3][inc])+'</td><td>'+Math.round(retData[4][inc])+'</td><td>'+Math.round(retData[5][inc])+'</td></tr>';
            if (typeof(retData[0][inc]) == 'string') {
               correctionFlag = 1;
            }
         });
         outp += '</table>';
         if (correctionFlag) {
            outp += '<p class="small">* 10 managers instead of 12, numbers have been extrapolated</p>';
         }
         document.getElementById("resultsArea").innerHTML = outp;
         var labels = {
            xaxis: 'Years',
            y1axis: 'Points',
            y2axis: ''
         },
         ydata = [],
         positions = ['QB', 'RB', 'WR', 'IDP', 'K'];
         // populate 5 position datasets
         for (var i = 0; i < 4; i++) {
            ydata.push({
               label: positions[i],
               type: 'line',
               borderColor: chartColors[i],
               data: retData[i+1],  // 0 index has xaxis/years
               yAxisID: 'left'
            });
         }
         drawChart('line', retData[0], ydata);
      },
      error: function(retData){
         console.log('trouble');
      }
   });
}

function displayMinmax(){
   $.ajax({
      type: 'POST',
      url: '/api/getminmaxyear',
      data: {
         'year': $('#yearList').val()
      },
      success:function(retData){
         var outp = '<table class="table table-sm table-striped"><tr class="small"><th>Wk</th><th onclick="sortTable(resultsArea, 1)">High</th><th>Manager</th><th onclick="sortTable(resultsArea, 3)">Low</th><th>Manager</th></tr>';
         for(i=0; i<13; i++) {
            outp += '<tr class="small"><td>'+(i+1)+'</td><td>'+retData.highs[i]+'</td><td>'+retData.high_managers[i]+'</td><td>'+retData.lows[i]+'</td><td>'+retData.low_managers[i]+'</td></tr>';
         }
         outp += '</table>';
         document.getElementById("resultsArea").innerHTML = outp;
         var ydata = [{
            label: 'Weekly High',
            type: 'line',
            borderColor: 'orange',
            // backgroundColor: '#244363',
            data: retData.highs,
         }, {
            label: 'Weekly Avg',
            type: 'line',
            borderColor: '#eee',
            // backgroundColor: '#eee',
            data: retData.avgs
         }, {
            label: 'Weekly Low',
            type: 'line',
            borderColor: '#244363',
            // backgroundColor: '#eee',
            data: retData.lows
         }];
         drawChart('line-zero', retData.weeks, ydata);
         // reset for no stacked bar chart
         // chart1.options.scales.xAxes[0].stacked = false;
         // chart1.options.scales.yAxes[0].stacked = false;
      },
      error: function(retData){
         console.log('Error getting player stats');
      }
   });
}

function displayMinmaxAll() {
   $.ajax({
      type: 'GET',
      url: '/api/getminmaxall',
      success: function(retData){
         var outp = '<table class="table table-sm table-striped"><tr class="small"><th onclick="sortTable(resultsArea, 0)">Year</th><th onclick="sortTable(resultsArea, 1)">High</th><th>Manager</th><th onclick="sortTable(resultsArea, 3)">Low</th><th>Manager</th></tr>';
         retData.years.forEach(function(year, idx){
            outp += '<tr class="small"><td>'+year+'</td><td>'+retData.highs[idx]+'</td><td>'+retData.high_managers[idx]+'</td><td>'+retData.lows[idx]+'</td><td>'+retData.low_managers[idx]+'</td></tr>';
         });
         outp += '</table>';
         document.getElementById("resultsArea").innerHTML = outp;
         var ydata = [{
            label: 'Weekly High',
            type: 'line',
            borderColor: 'orange',
            // backgroundColor: '#244363',
            data: retData.highs,
         }, {
            label: 'Weekly Avg',
            type: 'line',
            borderColor: '#eee',
            // backgroundColor: '#eee',
            data: retData.avgs
         }, {
            label: 'Weekly Low',
            type: 'line',
            borderColor: '#244363',
            // backgroundColor: '#eee',
            data: retData.lows
         }];
         drawChart('line-zero', retData.years, ydata);
         // reset for no stacked bar chart
         // chart1.options.scales.xAxes[0].stacked = false;
         // chart1.options.scales.yAxes[0].stacked = false;
      },
      error: function(err){
         console.log('error: '+err);
      }
   });
}

$('#yearList').change(function() {
   getManagers();
});

function sortTable(target, col) {
  var table, rows, switching, i, x, y, shouldSwitch;
  // table = document.getElementById(target);
  switching = true;
  while (switching) {
    switching = false;
    rows = target.getElementsByTagName("TR");
    for (i = 1; i < (rows.length - 1); i++) {
      //start by saying there should be no switching:
      shouldSwitch = false;
      x = rows[i].getElementsByTagName("TD")[col];
      y = rows[i + 1].getElementsByTagName("TD")[col];
      if (Number(x.innerHTML) < Number(y.innerHTML)) {
        shouldSwitch= true;
        break;
      }
    }
    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
    }
  }
}

function toggleManager(status){
   if (status == 1) {
      $('#managerList').removeAttr('disabled');
   } else {
      $('#managerList').attr('disabled','disabled');
   }
}

$('input[name="managerRadio"]').change(function() {
   toggleManager($(this).val());
});

$('input[name="statRadio"]').change(function() {
   $("input[name=managerRadio][value=0]").prop("checked",true);
   toggleManager($(this).val());
});
//       tempChart[num-1].options.scales.yAxes[0].ticks.beginAtZero = true;

function drawChart(type, xaxis, yaxis) {
   if (chart1)
      chart1.destroy();
   chart1 =  new Chart(document.getElementById("chartArea").getContext("2d"), {
      type: (type == 'pie')?'pie':(type.slice(0,3) == 'bar')?'bar':'line',
      data: {
         labels: xaxis,
         datasets: yaxis
      },
      options: {
         scales: {
            yAxes: [{
               position: 'left',
               id: 'left',
               gridLines: {
                  color: 'white'
               },
               scaleLabel: {
                  display: true,
                  color: 'white'
               },
               ticks: {
                  beginAtZero: (type.search('zero') > 0)?true:false
               },
               stacked: (type.search('stacked') > 0)?true:false
            // }, {
            //    position: 'right',
            //    id: 'right',
            //    scaleLabel: {
            //       display: true,
            //    }
            }],
            xAxes: [{
               scaleLabel: {
                  display: true,
               },
               stacked: (type.search('stacked') > 0)?true:false
            }]
         }
      }
   });
}
// multi use alert modal
function alert(type, message){
   $('#alertBody').removeClass();
   $('#alertBody').addClass('modal-content').addClass('modal-'+type);
   $('#alertText').text(message);
   $('#alertModal').modal();
   setTimeout(function(){
      $('#alertModal').modal('hide');
   }, 2000);
}

function getWeek(date){
   var wk, dst=0;
   var seasonStart = new Date(2016,8,8);
   var nflWeeks = [];
   for (var i=0;i<18;i++){
      if (i > 7)
         dst = 3600000;
      nflWeeks.push(new Date(seasonStart.valueOf()+i*7*86400000+dst));
   }
   for (i=0;i<17;i++){
      if (date > nflWeeks[i] && date < nflWeeks[i+1]) {
         wk = i+1;
         break;
      }
   }
   return wk;
}

// for Managers page
function getManagers (){
   $('#managerList').empty();
   $.ajax({
		type: 'POST',
		url: '/api/getmanagers',
      data: {
         'year': $('#yearList').val()
      },
		success:function(retData){
         $.each(retData, function(i, manager){
            $('#managerList').append('<option value="'+manager.name+'">'+manager.name+'</option>');
         });
      },
      error: function(retData){
         console.log('Error getting managers');
      }
   });
}

var chart1, chart2,
   nfc = ['ATL', 'ARZ', 'CAR', 'CHI', 'DAL', 'DET', 'GB', 'MIN', 'NO', 'NYG', 'PHI', 'SEA', 'SF', 'STL', 'TB', 'WAS' ],
   afc = ['BAL', 'BUF', 'CIN', 'CLE', 'DEN', 'HOU', 'KC', 'JAC', 'IND', 'MIA', 'NE', 'NYJ', 'OAK', 'PIT', 'SD', 'TEN'],
   nflTeams = ['Atlanta', 'Arizona', 'Carolina', 'Chicago', 'Dallas', 'Detroit', 'Green Bay', 'Minnesota', 'New Orleans', 'N.Y. Giants', 'Philadelphia', 'Seattle', 'San Francisco', 'L.A. Rams', 'Tampa Bay', 'Washington', 'Baltimore', 'Buffalo', 'Cincinatti', 'Cleveland', 'Denver', 'Houston', 'Kansas City', 'Jacksonville', 'Indianapolis', 'Miami', 'New England', 'N.Y. Jets', 'Oakland', 'Pittsburgh', 'San Diego', 'Tennessee'],
   nflColors = {
      Atlanta: '#A71930', ARZ: '#97233F', CAR: '#0085CA', CHI: '#0B162A', DAL: '#002244', DET: '#005A8B', GB: '#203731', MIN: '#4F2683', 'New Orleans': '#9F8958', NYG: '#0B2265', PHI: '#004953', SEA: '#69BE28', 'San Francisco': '#AA0000', STL: '#B3995D', TB: '#D50A0A', WAS: '#773141', Baltimore: '#241773', BUF: '#00338D', CIN: '#FB4F14', CLE: '#FB4F14', DEN: '#FB4F14', HOU: '#03202F', KC: '#E31837', JAC: '#006778', IND: '#002C5F', MIA: '#008E97', NE: '#002244', NYJ: '#203731', OAK: '#A5ACAF', PIT: '#FFB612', SD: '#0073CF', TEN: '#4B92DB'
   },
   chartColors = ['cyan', 'orange', 'green', '#eee', 'gray'];

$(document).ready(function() {
   // Chart.defaults.global.defaultFontColor = '#fff';
   Chart.defaults.global.elements.line.tension = 0;
   Chart.defaults.global.elements.line.borderWidth = 2;
   Chart.defaults.global.elements.line.fill = false;
   Chart.defaults.global.responsive = true;
   // chart1 = initChart(document.getElementById("chartArea").getContext("2d"), 'line');
   // chart2 = initChart(document.getElementById("chartArea2").getContext("2d"), 'line');
   // $('#chartArea').hide();
   // $('#chartArea2').hide();

   // initialize per page
   switch (window.location.pathname) {
      case '/':
         setPage(1);
         for (var i=2009; i<2017; i++)
            $('#yearList').append('<option value="'+i+'">'+i+'</option>');
         $('#yearList').append('<option value="All">All</option>');
         $('#yearList option[value="2016"]').attr("selected", "selected");
         getManagers();
         $('#dataHeading').text('Data');
         $("input[name=managerRadio][value=0]").prop("checked",true);
         break;
      case '/players':
         setPage(2);
         getPlayers();
         break;
      case '/defenses':
         setPage(3);
         $.each(nflTeams.sort(), function(i,rec) {
            $('#team1List').append('<option value="'+rec+'">'+rec+'</option>');
            $('#team2List').append('<option value="'+rec+'">'+rec+'</option>');
         });
         $('#team1List option[value="Baltimore"]').attr("selected", "selected");
         $('#team2List option[value="San Francisco"]').attr("selected", "selected");
         for (i=1; i<18; i++)
            $('#weekList').append('<option value="'+i+'">'+i+'</option>');
         $('#weekList option[value="1"]').attr("selected", "selected");
         break;
      }
});

// change navbar
function setPage(num) {
   $('#navbar li:nth-child('+(num+1)%3+')').removeClass('active');
   $('#navbar li:nth-child('+(num+2)%3+')').removeClass('active');
   $('#navbar li:nth-child('+num+')').addClass('active');
}

// for Players page
function getPlayers (){
   $('#playerList').empty().append('empty');
	$.ajax({
		type: 'POST',
		url: '/api/getplayers',
      data: {
         'position': $('#positionList').val(),
      },
      success:function(retData){
			$.each(retData, function(i,player){
				$('#playerList').append('<option value="'+player+'">'+player+'</option>');
			});
		},
		error: function(retData){
			alert(retData.type,retData.message);
		}
	});
}

$('#playerStats').on('click', function () {
   event.preventDefault();
   $.ajax({
		type: 'POST',
		url: '/api/getplayerstats',
      data: {
         'player': $('#playerList').val(),
         // 'year': $('#yearList').val()
      },
		success:function(retData){
         var weeks = [],
			rushing_tds = [],
         rushing_yards = [],
			receive_tds = [],
         receive_yards = [];
         $.each(retData, function(i,rec){
            weeks.push(rec.week);
				rushing_yards.push(rec.rushing_yards);
				receive_yards.push(rec.receive_yards);
				rushing_tds.push(rec.rushing_tds);
				receive_tds.push(rec.receive_tds);
         });
         var ydata = [{
               label: 'Rushing Yards',
               type: 'line',
               borderColor: 'blue',
               data: rushing_yards,
               yAxisID: 'left'
            }, {
               label: 'Passing Yards',
               type: 'line',
               borderColor: 'green',
               data: receive_yards,
               yAxisID: 'left'
            },	{
               label: 'Rushing TDs',
               // type: 'line',
               borderColor: 'cyan',
               backgroundColor: 'cyan',
               data: rushing_tds,
               yAxisID: 'right'
            }, {
               label: 'Passing TDs',
               // type: 'line',
               borderColor: 'greenyellow',
               backgroundColor: 'greenyellow',
               data: receive_tds,
               yAxisID: 'right'
            }],
         labels = {
            xaxis: 'Weeks',
            y1axis: 'Yards',
            y2axis: 'TDs'
         };
         drawChart('line', weeks, ydata);
      },
      error: function(retData){
         console.log('Error getting player stats');
      }
   });
});

$('#defenseStats').on('click', function(){
   event.preventDefault();
   var xaxis = ['pass/rec', 'rush'];
   $.ajax({
		type: 'POST',
		url: '/api/getplayerstats',
      data: {
         'player': $('#team1List').val(),
         'player2': $('#team2List').val(),
         'week': $('#weekList').val()
      },
		success:function(retData){
         var colors = ["cyan", "greenyellow", "white", "green", "yellow"],
            yardData = [],
            tdData = [];
         $.each(retData, function(i,rec) {
            var obj = {data: []},
               obj2 = {data: []};
            obj.label = obj2.label = rec.player;
            obj.type = obj2.type = 'bar';
            obj.backgroundColor = obj2.backgroundColor = nflColors[rec.player];
            obj.data.push(rec.passing_yards);
            obj2.data.push(rec.passing_tds);
            obj.data.push(rec.rushing_yards);
            obj2.data.push(rec.rushing_tds);
            yardData.push(obj);
            tdData.push(obj2);
         });
         drawChart(1, xaxis, yardData, {xaxis: 'Teams', y1axis: 'Yards',
            y2axis: ''}, true);
         drawChart(2, xaxis, tdData, {xaxis: 'Teams', y1axis: 'TDs',
               y2axis: ''}, true);
      },
      error: function(retData){
         console.log('Error getting defensive stats');
      }
   });
});

$('#positionList').change(function() {
   getPlayers();
});
