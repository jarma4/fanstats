function draftTable(retData){
   var outp = '<table class="table table-sm"><tr class="small"><th>Player</th><th onclick="displayDraft(1)">Position</th><th onclick="displayDraft(2)">Cost</th><th onclick="displayDraft(3)">Manager</th></tr>';
   retData.forEach(function(pick, idx){
      var color = {RB: 'orange', QB:'cyan', WR:'lightgreen', TE:'purple', LB:'#666', DE:'#666', S:'#666', CB:'#666', DT:'#666', K:'#000'};
      outp += '<tr class="small" bgcolor="'+color[pick.position]+'"><td>'+pick.player+'</td><td>'+pick.position+'</td><td>'+pick.cost+'</td><td>'+pick.manager+'</td></tr>';
   });
   outp += '</table>';
   return (outp);
}
function displayDraft(sortBy) {
   if ($('#yearList').val() != 'All') {
      $.ajax({
         type: 'POST',
         url: '/api/getdraft',
         data: {
            season: $('#yearList').val(),
            manager: ($('input[name="managerRadio"]:checked').val() == 1)?$('#managerList').val():'all',
            sort: sortBy
         },
         success: function(retData){
            $('#dataHeading1').text('Draft');
            $('#dataHeading2').text($('#yearList').val());
            var inner;
            if ($('input[name="managerRadio"]:checked').val() == '0') {
               document.getElementById("resultsArea").innerHTML = draftTable(retData);
            } else {
               var collection='';
               retData.forEach(function(manager){
                  collection += draftTable(manager);
               });
               document.getElementById("resultsArea").innerHTML = collection;
            }
            clearChart();
         },
         error: function(err){
            console.log('error: '+err);
         }
      });
   }
}
