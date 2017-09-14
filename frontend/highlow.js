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
      },
      error: function(err){
         console.log('error: '+err);
      }
   });
}
