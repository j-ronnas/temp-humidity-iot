
function DisplayLineChart(label, domID, xData, yData, yRange){
  let data = {
    labels: xData,
    datasets: [{
      label: label,
      backgroundColor: 'rgb(255, 99, 132)',
      borderColor: 'rgb(255, 99, 132)',
      data: yData,
    }]
  };


  let config = {
    type: 'line',
    data,
    options: {
      scales:{
        y:{
          suggestedMin: yRange.min,
          suggestedMax: yRange.max
        }
        
      }
    }
  };
  


  var myChart = new Chart(
    document.getElementById(domID),
    config
  );
}

fetch("http://192.168.3.125:3000/data?num=10")
.then(response => response.json())
.then((jsonRes) => {
  console.log(jsonRes);

  tempDisp = document.querySelector("#temp-display")
  tempDisp.innerHTML = "The current temperature is "+ jsonRes[0]["temp"] + " C"

  rhDisp = document.querySelector("#rh-display")
  rhDisp.innerHTML = "The current humidity is "+ jsonRes[0]["rh"] + " %"
  
  date = new Date(jsonRes[0]['time']*1000)
  timeDisp = document.querySelector("#time-display")
  
  timeDisp.innerHTML = "Measured at: "+ date.toString();
  
  tempData = []
  timeData = []
  rhData = []
  jsonRes.forEach(element => {
    d = new Date(element.time*1000);
    timeData.push(d.getHours() + ":" + d.getMinutes());
    tempData.push(element.temp);
    rhData.push(element.rh)
  });

  tempData.reverse();
  timeData.reverse();
  rhData.reverse();
  
  DisplayLineChart("Temperature", "temp-chart", timeData, tempData, {min:20,max:30})
  DisplayLineChart("Humidity", "rh-chart", timeData, rhData, {min: 20, max:80})

})





