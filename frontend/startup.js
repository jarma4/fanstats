var chart1, chart2,
	currentSeason = 2018,
   // seasonStart = new Date(2017,8,7),
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
         for (var i=2009; i<2019; i++)
            $('#yearList').append('<option value="'+i+'">'+i+'</option>');
         $('#yearList').append('<option value="All">All</option>');
         $('#yearList option[value="'+currentSeason+'"]').attr("selected", "selected");
         $("input[name=managerRadio][value=0]").prop("checked",true);
         getManagers().then(function(result){
            showData();
         });
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

function toggleManager(status){
   if (status > 1) {
      $("input[name=managerRadio][value=1]").attr('disabled','disabled');
      $('#managerList').attr('disabled','disabled');
   } else {
      $("input[name=managerRadio][value=1]").removeAttr('disabled');
      $('#managerList').removeAttr('disabled');
   }
}

// for Managers page
function getManagers (){
   return new Promise(function(resolve, reject){
		$('#managerList').empty();
		$('#managerList').append('<option value="League">League</option>');
      $.ajax({
         type: 'POST',
         url: '/api/getmanagers',
         data: {
            'season': $('#yearList').val()
         },
         success:function(retData){
            $.each(retData, function(i, manager){
               $('#managerList').append('<option value="'+manager.name+'">'+manager.name+'</option>');
            });
            resolve();
         },
         error: function(retData){
            console.log('Error getting managers');
         }
      });
   });
}

// function getWeek(date){
//    var dayTicks = 24 * 60 * 60 * 1000,
//       week = Math.ceil((date - seasonStart) / dayTicks / 7);
//    if (week < 0) {
//       return 1;
//    } else {
//       return week;
//    }
// }

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
      if ((isNaN(Number(x.innerHTML))?x.innerHTML:Number(x.innerHTML)) < (isNaN(Number(y.innerHTML))?y.innerHTML:Number(y.innerHTML))) {
        shouldSwitch= true;  
        break;
      }    
    }    
    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);  
      switching = true;
    }    
  }   
  $(target).find('th').removeClass('sort'); 
  $(target).find('th:eq('+col+')').addClass('sort'); 
}    

// change navbar
function setPage(num) {
   $('#navbar li:nth-child('+(num+1)%3+')').removeClass('active');
   $('#navbar li:nth-child('+(num+2)%3+')').removeClass('active');
   $('#navbar li:nth-child('+num+')').addClass('active');
}

