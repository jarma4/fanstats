function displayAlltime(){$("#yearList").val("All"),$("#yearList").attr("disabled","disabled"),$.ajax({type:"GET",url:"/api/getmanagertotals",success:function(t){$("#dataHeading1").text("Alltime Points"),$("#dataHeading2").text("");var a='<table class="table table-sm table-striped"><tr class="small"><th onclick="sortTable(resultsArea, 0)">Name</th><th onclick="sortTable(resultsArea, 1)">Years</th><th onclick="sortTable(resultsArea, 2)">Points</th><th onclick="sortTable(resultsArea, 3)">Avg</th></tr>';t.forEach(function(t,e){a+='<tr class="small"><td>'+t.manager+"</td><td>"+t.years+"</td><td>"+t.total.toPrecision(5)+"</td><td>"+(t.total/t.years).toPrecision(5)+"</td></tr>"}),a+="</table>",document.getElementById("resultsArea").innerHTML=a,sortTable(resultsArea,3),clearChart()},error:function(t){console.log("error: "+t)}})}function clearChart(){chart1&&chart1.destroy()}function drawChart(t,a,e){clearChart(),chart1=new Chart(document.getElementById("chartArea").getContext("2d"),{type:"pie"==t?"pie":"bar"==t.slice(0,3)?"bar":"line",data:{labels:a,datasets:e},options:{scales:{yAxes:[{position:"left",id:"left",gridLines:{color:"white"},scaleLabel:{display:!0,color:"white"},ticks:{beginAtZero:t.search("zero")>0},stacked:t.search("stacked")>0}],xAxes:[{scaleLabel:{display:!0},stacked:t.search("stacked")>0}]}}})}function draftTable(t){var a='<table class="table table-sm"><tr class="small"><th>Player</th><th onclick="displayDraft(1)">Position</th><th onclick="displayDraft(2)">Cost</th><th onclick="displayDraft(3)">Pick</th><th onclick="displayDraft(4)">Manager</th></tr>';return t.forEach(function(t,e){a+='<tr class="small" bgcolor="'+{RB:"orange",QB:"cyan",WR:"lightgreen",TE:"purple",LB:"#666",DE:"#666",S:"#666",CB:"#666",DT:"#666",K:"#000"}[t.position]+'"><td>'+t.player+"</td><td>"+t.position+"</td><td>"+t.cost+"</td><td>"+t.pick+"</td><td>"+t.manager+"</td></tr>"}),a+="</table>"}function displayDraft(t){$("#yearList").removeAttr("disabled"),$("#yearList").val(currentSeason),$.ajax({type:"POST",url:"/api/getdraft",data:{season:$("#yearList").val(),manager:1===$('input[name="managerRadio"]:checked').val()?$("#managerList").val():"all",sort:t},success:function(t){$("#dataHeading1").text("Draft"),$("#dataHeading2").text($("#yearList").val()),document.getElementById("resultsArea").innerHTML=draftTable(t),clearChart()},error:function(t){console.log("error: "+t)}})}function displayMinmax(){$.ajax({type:"POST",url:"/api/getminmaxyear",data:{season:$("#yearList").val()},success:function(t){var a='<table class="table table-sm table-striped"><tr class="small"><th>Wk</th><th onclick="sortTable(resultsArea, 1)">High</th><th>Manager</th><th onclick="sortTable(resultsArea, 3)">Low</th><th>Manager</th></tr>';for(i=0;i<13;i++)a+='<tr class="small"><td>'+(i+1)+"</td><td>"+t.highs[i]+"</td><td>"+t.high_managers[i]+"</td><td>"+t.lows[i]+"</td><td>"+t.low_managers[i]+"</td></tr>";a+="</table>",document.getElementById("resultsArea").innerHTML=a;var e=[{label:"Weekly High",type:"line",borderColor:"orange",data:t.highs},{label:"Weekly Avg",type:"line",borderColor:"#eee",data:t.avgs},{label:"Weekly Low",type:"line",borderColor:"#244363",data:t.lows}];drawChart("line-zero",t.weeks,e)},error:function(t){console.log("Error getting player stats")}})}function displayMinmaxAll(){$.ajax({type:"GET",url:"/api/getminmaxall",success:function(t){var a='<table class="table table-sm table-striped"><tr class="small"><th onclick="sortTable(resultsArea, 0)">Year</th><th onclick="sortTable(resultsArea, 1)">High</th><th>Manager</th><th onclick="sortTable(resultsArea, 3)">Low</th><th>Manager</th></tr>';t.years.forEach(function(e,l){a+='<tr class="small"><td>'+e+"</td><td>"+t.highs[l]+"</td><td>"+t.high_managers[l]+"</td><td>"+t.lows[l]+"</td><td>"+t.low_managers[l]+"</td></tr>"}),a+="</table>",document.getElementById("resultsArea").innerHTML=a;var e=[{label:"Weekly High",type:"line",borderColor:"orange",data:t.highs},{label:"Weekly Avg",type:"line",borderColor:"#eee",data:t.avgs},{label:"Weekly Low",type:"line",borderColor:"#244363",data:t.lows}];drawChart("line-zero",t.years,e)},error:function(t){console.log("error: "+t)}})}function getPlayers(){$("#playerList").empty().append("empty"),$.ajax({type:"POST",url:"/api/getplayers",data:{position:$("#positionList").val()},success:function(t){$.each(t,function(t,a){$("#playerList").append('<option value="'+a+'">'+a+"</option>")})},error:function(t){alert(t.type,t.message)}})}function showData(){switch($('input[name="statRadio"]:checked').val()){case"0":$("#dataHeading1").text("Points by Position"),$("#dataHeading2").text($("#yearList").val()),$("#yearList").removeAttr("disabled"),"All"!=$("#yearList").val()?"League"===$("#managerList").val()?displayLeagueYear():displayManagerYear():displayAll();break;case"1":$("#dataHeading1").text("Highs/Lows"),$("#dataHeading2").text($("#yearList").val()),$("#yearList").removeAttr("disabled"),"All"==$("#yearList").val()?displayMinmaxAll():displayMinmax();break;case"2":displayAlltime();break;case"3":displayStreaks();break;case"4":displayDraft(2)}}function managerTotals(t){var a="",e=0,l=0,r=0,s=0,o=0,n=0,i=0,d=[],c=[],h=[];return $.each(t,function(t,u){e+=u.qb,l+=u.rb1+u.rb2+(u.rb3?u.rb3:0),r+=u.wr1+u.wr2+(u.wr3?u.wr3:0),s+=2011==u.season?u.dst:u.idp1+u.idp2+u.idp3,o+=u.te,n+=u.k,i+=u.total,h.push(u.week),d.push(u.total),c.push(t>1?(d[t]+d[t-1]+d[t-2])/3:null),a+='<tr class="small"><td>'+u.week+"</td><td>"+u.qb+"</td><td>"+u.rb1+"</td><td>"+u.rb2+"</td><td>"+u.wr1+"</td><td>"+u.wr2+"</td><td>"+(u.season<2017?u.wr3te:u.te)+"</td><td>"+u.idp1+"</td><td>"+u.idp2+"</td><td>"+u.idp3+"</td><td>"+($("#yearList").val()<2017?u.k:u.rb3?u.rb3:u.wr3)+"</td><td>"+u.total+"</td></tr>"}),{totalQb:e,totalRb:l,totalWr:r,totalIdp:s,totalTe:o,totalK:n,totalTotal:i,chartTotals:d,chartAverage:c,chartWeeks:h,outp:a}}function displayManagerYear(){$.ajax({type:"POST",url:"/api/getmanagerstats",data:{manager:$("#managerList").val(),season:$("#yearList").val()},success:function(t){$("#dataHeading1").text("Manager: "+$("#managerList").val()),$("#dataHeading2").text("Year: "+$("#yearList").val());var a='<table class="table table-sm table-striped"><tr class="small"><th>Wk</th><th>QB</th><th>RB</th><th>RB</th><th>WR</th><th>WR</th><th>'+($("#yearList").val()<2017?"WRTE3":"TE")+"</th><th>IDP</th><th>IDP</th><th>IDP</th><th>"+($("#yearList").val()<2017?"K":"FLX")+"</th><th>Total</th></tr>",e=managerTotals(t);a+=e.outp+"</table>",a+='<table class="table table-sm"><tr class="small"><th>Total QB</th><th>Total RB</th><th>Total WR</th><th>Total IDP</th><th>'+($("#yearList").val()<2017?"Total K":"Total TE")+"</th><th>Total</th></tr>",a+='<tr class="small"><td>'+e.totalQb.toPrecision(4)+" ("+(e.totalQb/e.totalTotal*100).toPrecision(3)+"%)</td><td>"+e.totalRb.toPrecision(4)+" ("+(e.totalRb/e.totalTotal*100).toPrecision(3)+"%)</td><td>"+e.totalWr.toPrecision(4)+" ("+(e.totalWr/e.totalTotal*100).toPrecision(3)+"%)</td><td>"+e.totalIdp.toPrecision(4)+" ("+(e.totalIdp/e.totalTotal*100).toPrecision(3)+"%)</td><td>"+($("#yearList").val()<2017?e.totalK:e.totalTe).toPrecision(4)+" ("+(($("#yearList").val()<2017?e.totalK:e.totalTe)/e.totalTotal*100).toPrecision(3)+"%)</td><td>"+e.totalTotal.toPrecision(5)+"</td></tr>",document.getElementById("resultsArea").innerHTML=a;var l=[{label:"Total Points",type:"line",borderColor:"#244363",data:e.chartTotals,yAxisID:"left"},{label:"3week Avg",type:"line",borderDash:[10,5],borderColor:"white",data:e.chartAverage,yAxisID:"left"}];drawChart("line-zero",e.chartWeeks,l)},error:function(t){console.log("Error getting stats")}})}function displayLeagueYear(){var t=0,a=0,e=0,l=0,r=0,s=0,o=0,n=0,i='<table id="leagueTable" class="table table-sm table-striped table-bordered"><tr class="small"><th>Who</th><th onclick="sortTable(leagueTable, 1)">Total QB</th><th onclick="sortTable(leagueTable, 2)">Total RB</th><th onclick="sortTable(leagueTable, 3)">Total WR</th><th onclick="sortTable(leagueTable, 4)">Total IDP</th><th onclick="sortTable(leagueTable, 5)">Total '+($("#yearList").val()<2017?"K":"TE")+'</th><th onclick="sortTable(leagueTable, 6)">Total</th><th onclick="sortTable(leagueTable, 7)">Wk Avg </th></tr></table>';document.getElementById("resultsArea").innerHTML=i;var d=[];$.each($("#managerList option"),function(i){var c=$(this).val(),h=new Promise(function(i,d){$.ajax({type:"POST",url:"/api/getmanagerstats",asynchronous:!1,data:{manager:c,season:$("#yearList").val()},success:function(d){n=d.length;var h=managerTotals(d);h.totalQb&&($("#leagueTable tr:last").after('<tr class="small"><td>'+c+"</td><td>"+h.totalQb.toPrecision(4)+"</td><td>"+h.totalRb.toPrecision(4)+"</td><td>"+h.totalWr.toPrecision(4)+"</td><td>"+h.totalIdp.toPrecision(4)+"</td><td>"+($("#yearList").val()<2017?h.totalK.toPrecision(4):h.totalTe.toPrecision(4))+"</td><td>"+h.totalTotal.toPrecision(4)+"</td><td>"+(h.totalTotal/n).toPrecision(4)+"</td></tr>"),t+=h.totalQb,a+=h.totalRb,e+=h.totalWr,l+=h.totalIdp,s+=h.totalK,r+=h.totalTe,o+=h.totalTotal),i()},error:function(t){console.log("trouble"),d()}})});d.push(h)}),$.when.apply(void 0,d).done(function(){sortTable(leagueTable,4),$("#leagueTable tr:last").after('<tr class="table-danger small"><td>League</td><td>'+t.toPrecision(4)+" ("+(t/o*100).toPrecision(3)+"%)</td><td>"+a.toPrecision(4)+" ("+(a/o*100).toPrecision(3)+"%)</td><td>"+e.toPrecision(4)+" ("+(e/o*100).toPrecision(3)+"%)</td><td>"+l.toPrecision(4)+" ("+(l/o*100).toPrecision(3)+"%)</td><td>"+($("#yearList").val()<2017?s.toPrecision(4)+" ("+(s/o*100).toPrecision(3):r.toPrecision(4)+" ("+(r/o*100).toPrecision(3))+"%)</td><td>"+o.toPrecision(5)+"&nbsp</td><td>"+(o/$("#managerList > option").length/($("#yearList").val()!=currentSeason?13:n)).toPrecision(5)+"&nbsp</td></tr>"),drawChart("pie",["QB","RB","WR","IDP","K"],[{label:"Position Totals",type:"pie",backgroundColor:chartColors,data:[t,a,e,l,s],yAxisID:"left"}])})}function displayAll(){$.ajax({type:"POST",url:"/api/getleaguehistory",data:{manager:1==$('input[name="managerRadio"]:checked').val()?$("#managerList").val():"all",start:2012,end:2016},success:function(t){var a=0,e='<table class="table table-sm"><tr class="small"><th>Year</th><th>Total QB</th><th>Total RB</th><th>Total WR</th><th>Total IDP</th><th>Total K</th></tr>';t[0].forEach(function(l,r){e+='<tr class="small"><td>'+t[0][r]+"</td><td> "+Math.round(t[1][r])+"</td><td>"+Math.round(t[2][r])+"</td><td>"+Math.round(t[3][r])+"</td><td>"+Math.round(t[4][r])+"</td><td>"+Math.round(t[5][r])+"</td></tr>","string"==typeof t[0][r]&&(a=1)}),e+="</table>",a&&(e+='<p class="small">* 10 managers instead of 12, numbers have been extrapolated</p>'),document.getElementById("resultsArea").innerHTML=e;for(var l=[],r=["QB","RB","WR","IDP","K"],s=0;s<4;s++)l.push({label:r[s],type:"line",borderColor:chartColors[s],data:t[s+1],yAxisID:"left"});drawChart("line",t[0],l)},error:function(t){console.log("trouble")}})}$('input[name="statRadio"]').change(function(){$(this).val()>1&&$("input[name=managerRadio][value=0]").prop("checked",!0),showData()}),$("#yearList").change(function(){getManagers().then(function(){showData()})}),$("#managerList").change(function(){showData()}),$("#playerStats").on("click",function(){event.preventDefault(),$.ajax({type:"POST",url:"/api/getplayerstats",data:{player:$("#playerList").val()},success:function(t){var a=[],e=[],l=[],r=[],s=[];$.each(t,function(t,o){a.push(o.week),l.push(o.rushing_yards),s.push(o.receive_yards),e.push(o.rushing_tds),r.push(o.receive_tds)});drawChart("line",a,[{label:"Rushing Yards",type:"line",borderColor:"blue",data:l,yAxisID:"left"},{label:"Passing Yards",type:"line",borderColor:"green",data:s,yAxisID:"left"},{label:"Rushing TDs",borderColor:"cyan",backgroundColor:"cyan",data:e,yAxisID:"right"},{label:"Passing TDs",borderColor:"greenyellow",backgroundColor:"greenyellow",data:r,yAxisID:"right"}])},error:function(t){console.log("Error getting player stats")}})}),$("#defenseStats").on("click",function(){event.preventDefault();var t=["pass/rec","rush"];$.ajax({type:"POST",url:"/api/getplayerstats",data:{player:$("#team1List").val(),player2:$("#team2List").val(),week:$("#weekList").val()},success:function(a){var e=[],l=[];$.each(a,function(t,a){var r={data:[]},s={data:[]};r.label=s.label=a.player,r.type=s.type="bar",r.backgroundColor=s.backgroundColor=nflColors[a.player],r.data.push(a.passing_yards),s.data.push(a.passing_tds),r.data.push(a.rushing_yards),s.data.push(a.rushing_tds),e.push(r),l.push(s)}),drawChart(1,t,e,{xaxis:"Teams",y1axis:"Yards",y2axis:""},!0),drawChart(2,t,l,{xaxis:"Teams",y1axis:"TDs",y2axis:""},!0)},error:function(t){console.log("Error getting defensive stats")}})}),$("#positionList").change(function(){getPlayers()});var chart1,chart2,currentSeason=2018,nfc=["ATL","ARZ","CAR","CHI","DAL","DET","GB","MIN","NO","NYG","PHI","SEA","SF","STL","TB","WAS"],afc=["BAL","BUF","CIN","CLE","DEN","HOU","KC","JAC","IND","MIA","NE","NYJ","OAK","PIT","SD","TEN"],nflTeams=["Atlanta","Arizona","Carolina","Chicago","Dallas","Detroit","Green Bay","Minnesota","New Orleans","N.Y. Giants","Philadelphia","Seattle","San Francisco","L.A. Rams","Tampa Bay","Washington","Baltimore","Buffalo","Cincinatti","Cleveland","Denver","Houston","Kansas City","Jacksonville","Indianapolis","Miami","New England","N.Y. Jets","Oakland","Pittsburgh","San Diego","Tennessee"],nflColors={Atlanta:"#A71930",ARZ:"#97233F",CAR:"#0085CA",CHI:"#0B162A",DAL:"#002244",DET:"#005A8B",GB:"#203731",MIN:"#4F2683","New Orleans":"#9F8958",NYG:"#0B2265",PHI:"#004953",SEA:"#69BE28","San Francisco":"#AA0000",STL:"#B3995D",TB:"#D50A0A",WAS:"#773141",Baltimore:"#241773",BUF:"#00338D",CIN:"#FB4F14",CLE:"#FB4F14",DEN:"#FB4F14",HOU:"#03202F",KC:"#E31837",JAC:"#006778",IND:"#002C5F",MIA:"#008E97",NE:"#002244",NYJ:"#203731",OAK:"#A5ACAF",PIT:"#FFB612",SD:"#0073CF",TEN:"#4B92DB"},chartColors=["cyan","orange","green","#eee","gray"];function toggleManager(t){t>1?($("input[name=managerRadio][value=1]").attr("disabled","disabled"),$("#managerList").attr("disabled","disabled")):($("input[name=managerRadio][value=1]").removeAttr("disabled"),$("#managerList").removeAttr("disabled"))}function getManagers(){return new Promise(function(t,a){$("#managerList").empty(),$("#managerList").append('<option value="League">League</option>'),$.ajax({type:"POST",url:"/api/getmanagers",data:{season:$("#yearList").val()},success:function(a){$.each(a,function(t,a){$("#managerList").append('<option value="'+a.name+'">'+a.name+"</option>")}),t()},error:function(t){console.log("Error getting managers")}})})}function sortTable(t,a){var e,l,r,s,o,n;for(l=!0;l;){for(l=!1,e=t.getElementsByTagName("TR"),r=1;r<e.length-1;r++)if(n=!1,s=e[r].getElementsByTagName("TD")[a],o=e[r+1].getElementsByTagName("TD")[a],(isNaN(Number(s.innerHTML))?s.innerHTML:Number(s.innerHTML))<(isNaN(Number(o.innerHTML))?o.innerHTML:Number(o.innerHTML))){n=!0;break}n&&(e[r].parentNode.insertBefore(e[r+1],e[r]),l=!0)}$(t).find("th").removeClass("sort"),$(t).find("th:eq("+a+")").addClass("sort")}function setPage(t){$("#navbar li:nth-child("+(t+1)%3+")").removeClass("active"),$("#navbar li:nth-child("+(t+2)%3+")").removeClass("active"),$("#navbar li:nth-child("+t+")").addClass("active")}function displayStreaks(){$("#yearList").val("All"),$.ajax({type:"POST",url:"/api/getstreaks",data:{season:"All"},success:function(t){$("#dataHeading1").text("Longest Streaks"),$("#dataHeading2").text("");var a='<table class="table table-sm table-striped"><tr class="small"><th onclick="sortTable(resultsArea, 0)">Name</th><th onclick="sortTable(resultsArea, 1)">Start</th><th onclick="sortTable(resultsArea, 2)">Win</th><th onclick="sortTable(resultsArea, 3)">Lose</th><th onclick="sortTable(resultsArea, 4)">Year</th><th onclick="sortTable(resultsArea, 5)">Playoffs</th></tr>';t.forEach(function(t,e){a+='<tr class="small"><td>'+t.manager+"</td><td>"+t.start+"</td><td>"+t.longestWin+"</td><td>"+t.longestLose+"</td><td>"+t.season+"</td><td>"+(t.playoffs?t.playoffs:"")+"</td></tr>"}),a+="</table>",document.getElementById("resultsArea").innerHTML=a,sortTable(resultsArea,3),clearChart()},error:function(t){console.log("error: "+t)}})}$(document).ready(function(){switch(Chart.defaults.global.elements.line.tension=0,Chart.defaults.global.elements.line.borderWidth=2,Chart.defaults.global.elements.line.fill=!1,Chart.defaults.global.responsive=!0,window.location.pathname){case"/":setPage(1);for(var t=2009;t<2019;t++)$("#yearList").append('<option value="'+t+'">'+t+"</option>");$("#yearList").append('<option value="All">All</option>'),$('#yearList option[value="'+currentSeason+'"]').attr("selected","selected"),$("input[name=managerRadio][value=0]").prop("checked",!0),getManagers().then(function(t){showData()});break;case"/players":setPage(2),getPlayers();break;case"/defenses":for(setPage(3),$.each(nflTeams.sort(),function(t,a){$("#team1List").append('<option value="'+a+'">'+a+"</option>"),$("#team2List").append('<option value="'+a+'">'+a+"</option>")}),$('#team1List option[value="Baltimore"]').attr("selected","selected"),$('#team2List option[value="San Francisco"]').attr("selected","selected"),t=1;t<18;t++)$("#weekList").append('<option value="'+t+'">'+t+"</option>");$('#weekList option[value="1"]').attr("selected","selected")}});