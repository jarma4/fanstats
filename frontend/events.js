$('#yearList').change(function() {
	getManagers().then(function(){
      showData();
   });
});

$('#managerList').change(function() {
   $("input[name=managerRadio][value=1]").prop("checked",true);
});

$('input[name="statRadio"]').change(function() {
   if ($(this).val() > 1)
      $("input[name=managerRadio][value=0]").prop("checked",true);
   toggleManager($(this).val());
   showData();
});

$('#getStats').on('click', function () {
   showData();
});

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
