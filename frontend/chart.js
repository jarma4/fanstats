function clearChart(){
   if (chart1)
      chart1.destroy();
}

function drawChart(type, xaxis, yaxis) {
   clearChart();
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
