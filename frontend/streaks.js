function displayStreaks() {
   $.ajax({
      type: 'POST',
      url: '/api/getstreaks',
      data: {
         season: $('#yearList').val()
      },
      success: function(retData){
         $('#dataHeading1').text('Streaks '+$('#yearList').val());
         $('#dataHeading2').text('');
         var outp = '<table class="table table-sm table-striped"><tr class="small"><th onclick="sortTable(resultsArea, 0)">Name</th><th onclick="sortTable(resultsArea, 1)">Season Start</th><th onclick="sortTable(resultsArea, 2)">Longest Win</th><th onclick="sortTable(resultsArea, 3)">Longest Lose</th><th onclick="sortTable(resultsArea, 4)">Made Playoffs</th></tr>';
         retData.forEach(function(manager, idx){
            outp += '<tr class="small"><td>'+manager.manager+'</td><td>'+manager.start+'</td><td>'+manager.longestWin+'</td><td>'+manager.longestLose+'</td><td>'+((manager.playoffs)?manager.playoffs:'')+'</td></tr>';
         });
         outp += '</table>';
         document.getElementById("resultsArea").innerHTML = outp;
         sortTable(resultsArea, 3);
         clearChart();
      },
      error: function(err){
         console.log('error: '+err);
      }
   });
}
