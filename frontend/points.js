function showData(){
   switch ($('input[name="statRadio"]:checked').val()) {
   case '0':
      $('#dataHeading1').text('Points by Position');
		$('#dataHeading2').text($('#yearList').val());
		$('#yearList').removeAttr('disabled');
      if ($('#yearList').val() != 'All'){
         if ($('#managerList').val() === 'League') {
            displayLeagueYear();
			} else {
            displayManagerYear();
         }
      } else {
         displayAll();
      }
      break;
   case '1': // Highs/Lows
      $('#dataHeading1').text('Highs/Lows');
		$('#dataHeading2').text($('#yearList').val());
		$('#yearList').removeAttr('disabled');
      if ($('#yearList').val() == 'All'){
         displayMinmaxAll();
      } else {
         displayMinmax();
      }
      break;
   case '2':
      displayAlltime();
      break;
   case '3':
      displayStreaks();
      break;
   case '4':
      displayDraft(2);
      break;
   }
}

function managerTotals(data) {
   var outp = '',
   totalQb = 0,
   totalRb = 0,
   totalWr = 0,
   totalIdp = 0,
   totalTe = 0,
   totalK = 0,
   totalTotal = 0,
   chartTotals = [],
   chartAverage = [],
   chartWeeks = [];
   $.each(data, function(i,rec){
      // process data to get totals
      totalQb += rec.qb;
      totalRb += rec.rb1 + rec.rb2 + ((rec.rb3)?rec.rb3:0);
      totalWr += rec.wr1 + rec.wr2 + ((rec.wr3)?rec.wr3:0);
      totalIdp += ((rec.season == 2011)?rec.dst:rec.idp1 + rec.idp2 + rec.idp3);
      totalTe += rec.te;
      totalK += rec.k;
      totalTotal += rec.total;
      // store weekly data in array to chart later
      chartWeeks.push(rec.week);
      chartTotals.push(rec.total);
      // starting week 3, create running 3 week average
      chartAverage.push((i > 1)?(chartTotals[i]+chartTotals[i-1]+chartTotals[i-2])/3:null);
      // go ahead and store table rows for each week although not used when showing league
      outp += '<tr class="small"><td>'+rec.week+'</td><td>'+rec.qb+'</td><td>'+rec.rb1+'</td><td>'+rec.rb2+'</td><td>'+rec.wr1+'</td><td>'+rec.wr2+'</td><td>'+((rec.season < 2017)?rec.wr3te:rec.te)+'</td><td>'+rec.idp1+'</td><td>'+rec.idp2+'</td><td>'+rec.idp3+'</td><td>'+(($('#yearList').val()<2017)?rec.k:(rec.rb3)?rec.rb3:rec.wr3)+'</td><td>'+rec.total+'</td></tr>';
   });
   return {
      totalQb: totalQb,
      totalRb: totalRb,
      totalWr: totalWr,
      totalIdp: totalIdp,
      totalTe: totalTe,
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
         'season': $('#yearList').val()
      },
      success:function(retData){
         $('#dataHeading1').text('Manager: '+$('#managerList').val());
         $('#dataHeading2').text('Year: '+$('#yearList').val());
         // create first table with weekly totals for single manager
         var outp = '<table class="table table-sm table-striped"><tr class="small"><th>Wk</th><th>QB</th><th>RB</th><th>RB</th><th>WR</th><th>WR</th><th>'+(($('#yearList').val() < 2017)?'WRTE3':'TE')+'</th><th>IDP</th><th>IDP</th><th>IDP</th><th>'+(($('#yearList').val()<2017)?'K':'FLX')+'</th><th>Total</th></tr>';
         var totals = managerTotals(retData);
         outp += totals.outp + '</table>';
         // second table with positional totals for single manager
         outp += '<table class="table table-sm"><tr class="small"><th>QB</th><th>RB</th><th>WR</th><th>IDP</th><th>'+(($('#yearList').val()<2017)?'K':'Total TE')+'</th><th>Total</th></tr>';
         outp += '<tr class="small"><td>'+totals.totalQb.toPrecision(4)+' ('+(totals.totalQb/totals.totalTotal*100).toPrecision(3)+'%)</td><td>'+totals.totalRb.toPrecision(4)+' ('+(totals.totalRb/totals.totalTotal*100).toPrecision(3)+'%)</td><td>'+totals.totalWr.toPrecision(4)+' ('+(totals.totalWr/totals.totalTotal*100).toPrecision(3)+'%)</td><td>'+totals.totalIdp.toPrecision(4)+' ('+(totals.totalIdp/totals.totalTotal*100).toPrecision(3)+'%)</td><td>'+(($('#yearList').val()<2017)?totals.totalK:totals.totalTe).toPrecision(4)+' ('+((($('#yearList').val()<2017)?totals.totalK:totals.totalTe)/totals.totalTotal*100).toPrecision(3)+'%)</td><td>'+totals.totalTotal.toPrecision(5)+'</td></tr>';
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
   leagueTe = 0,
   leagueK = 0,
   leagueTotal = 0,
   numweeks = 0;
   // $('#dataHeading1').text('League Totals');
   // $('#dataHeading2').text('Year: '+$('#yearList').val());
   // create table and display, manager rows added later
   var outp = '<table id="leagueTable" class="table table-sm table-striped table-bordered"><tr class="small"><th>Who</th><th onclick="sortTable(leagueTable, 1)">QB</th><th onclick="sortTable(leagueTable, 2)">RB</th><th onclick="sortTable(leagueTable, 3)">WR</th><th onclick="sortTable(leagueTable, 4)">IDP</th><th onclick="sortTable(leagueTable, 5)">'+(($('#yearList').val()<2017)?'K':'TE')+'</th><th onclick="sortTable(leagueTable, 6)">Total</th><th onclick="sortTable(leagueTable, 7)">Wk Avg </th></tr></table>';
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
               'season': $('#yearList').val()
            },
            success:function(retData){
               numweeks = retData.length;
               // get totals for manager
               var totals = managerTotals(retData);
               if (totals.totalQb) {   // make sure data exists
                  $('#leagueTable tr:last').after('<tr class="small"><td>'+manager+'</td><td>'+totals.totalQb.toPrecision(4)+'</td><td>'+totals.totalRb.toPrecision(4)+'</td><td>'+totals.totalWr.toPrecision(4)+'</td><td>'+totals.totalIdp.toPrecision(4)+'</td><td>'+(($('#yearList').val()<2017)?totals.totalK.toPrecision(4):totals.totalTe.toPrecision(4))+'</td><td>'+totals.totalTotal.toPrecision(4)+'</td><td>'+(totals.totalTotal/numweeks).toPrecision(4)+'</td></tr>');
                  leagueQb += totals.totalQb;
                  leagueRb += totals.totalRb;
                  leagueWr += totals.totalWr;
                  leagueIdp += totals.totalIdp;
                  leagueK += totals.totalK;
                  leagueTe += totals.totalTe;
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
      $('#leagueTable tr:last').after('<tr class="table-danger small"><td>League</td><td>'+leagueQb.toPrecision(4)+' ('+(leagueQb/leagueTotal*100).toPrecision(3)+'%)</td><td>'+leagueRb.toPrecision(4)+' ('+(leagueRb/leagueTotal*100).toPrecision(3)+'%)</td><td>'+leagueWr.toPrecision(4)+' ('+(leagueWr/leagueTotal*100).toPrecision(3)+'%)</td><td>'+leagueIdp.toPrecision(4)+' ('+(leagueIdp/leagueTotal*100).toPrecision(3)+'%)</td><td>'+(($('#yearList').val()<2017)?leagueK.toPrecision(4)+' ('+(leagueK/leagueTotal*100).toPrecision(3):leagueTe.toPrecision(4)+' ('+(leagueTe/leagueTotal*100).toPrecision(3))+'%)</td><td>'+leagueTotal.toPrecision(5)+'&nbsp</td><td>'+(leagueTotal/$('#managerList > option').length/(($('#yearList').val()!= currentSeason)?13:numweeks)).toPrecision(5)+'&nbsp</td></tr>');
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
