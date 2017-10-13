function displayAlltime() {
   $.ajax({
      type: 'GET',
      url: '/api/getmanagertotals',
      success: function(retData){
         $('#dataHeading1').text('Alltime Points');
         $('#dataHeading2').text('');
         var outp = '<table class="table table-sm table-striped"><tr class="small"><th onclick="sortTable(resultsArea, 0)">Name</th><th onclick="sortTable(resultsArea, 1)">Years</th><th onclick="sortTable(resultsArea, 2)">Points</th><th onclick="sortTable(resultsArea, 3)">Avg</th></tr>';
         retData.forEach(function(manager, idx){
            outp += '<tr class="small"><td>'+manager.manager+'</td><td>'+manager.years+'</td><td>'+manager.total.toPrecision(5)+'</td><td>'+(manager.total/manager.years).toPrecision(5)+'</td></tr>';
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
