document.addEventListener('DOMContentLoaded', function () {
    // --- Element References ---
    const startStopButton = document.getElementById('startStopButton');
    const resetButton = document.getElementById('resetButton');
    const numberButtonsContainer = document.querySelector('.number-buttons');
    const timerLabel = document.querySelector('.timer-label');
    const chartCanvas = document.getElementById('myChart');

    // --- Chart Setup ---
    const ctx = chartCanvas.getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Pain Level',
                data: [],
                pointBackgroundColor: 'blue',
                showLine: false
            },
            {
                type: 'line',
                label: 'Line',
                data: [],
                borderColor: 'black',
                borderWidth: 2,
                 pointRadius: 0,
                 fill: false,
                 tension:0
             }]
        },
       options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: { display: true, text: 'Time (sec)' },
                    min: 0,
                    max: 60,
                    ticks: { stepSize: 5 }
                },
                y: {
                   title: { display: true, text: 'Pain' },
                    min: -1,
                    max: 11,
                    ticks: {
                       stepSize: 1, beginAtZero: true,
                          callback: function (value) {
                          if (value === -1 || value === 11) {
                            return ''; // Hide -1 and 11 tick labels
                           }
                             return value;
                          },
                     }
                }
            },
          plugins: {
             legend: {
                display: false
             }
          },
           animation: false, // Add this line to globally disable animations
            transitions: {
                show: {
                    animations: {
                        x: { from: 0 },
                        y: { from: 0 }
                    }
                },
               hide: {
                    animations: {
                        x: { from: 0 },
                        y: { from: 0 }
                    }
                }
            }
        }
    });


    // --- Data Variables ---
    let xValues = [];
    let yValues = [];
    let start_time = null;
    let isRunning = false;
    let lastValue = null;
    let currentLineX = [];
    let previousX = null;
    let previousY = null;
    let lineSegments = [];
    let lastDotValue = null;
    let lastProcessedValue = null;

    // --- Number Buttons ---
     for (let i = 0; i <= 10; i++) { // Changed for loop
        const button = document.createElement('button');
        button.textContent = i.toString();
        button.addEventListener('click', function () {
            addPoint(i);
        });
          numberButtonsContainer.prepend(button); // prepending to put the buttons in reverse order
    }

   // --- Functions ---
   function addPoint(value) {
    if (isRunning) {
            const currentTime = (Date.now() / 1000) - start_time;
            if (value !== lastProcessedValue) {
                if (lastValue !== null && currentLineX.length > 0) {
                    lineSegments.push([[previousX,currentLineX[0],currentLineX[0], currentTime],[previousY,previousY,lastValue,lastValue]]) // store line segment
                    previousX = currentLineX[0]
                    previousY = lastValue
                }
                lastValue = value
                currentLineX = [currentTime]
                 // Only add point if it's the first click of this value
                if (value != lastDotValue) {
                     xValues.push(currentTime);
                     yValues.push(value);
                     myChart.data.datasets[0].data = xValues.map((x, index) => ({ x, y: yValues[index]}));
                     myChart.update();
                     lastDotValue = value
                }
                 lastProcessedValue = value
            }
        }
    }

   function toggleTimer() {
        if (!isRunning) {
            startTimer();
        } else {
            stopTimer();
        }
    }

    function startTimer() {
        isRunning = true;
        start_time = Date.now() / 1000;
        updateTimer();
        updatePlot();
    }

    function stopTimer() {
        isRunning = false;
    }


    function updateTimer() {
         if (isRunning) {
            const elapsed_time = (Date.now() / 1000) - start_time;
             const hours = Math.floor(elapsed_time / 3600);
             const minutes = Math.floor((elapsed_time % 3600) / 60);
            const seconds = Math.floor(elapsed_time % 60);
            const milliseconds = Math.floor((elapsed_time * 1000) % 1000);

            const timerText = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
             timerLabel.textContent = timerText;
            setTimeout(updateTimer, 10);
        }
    }

    function updatePlot() {
    if (isRunning) {
      const currentTime = (Date.now() / 1000) - start_time;
       if (lastValue !== null) {
        if(currentLineX.length > 0){
           let lineData = []
           if(typeof previousX !== 'undefined' && typeof previousY !== 'undefined') {
               lineSegments.forEach(lineSegment => {
                       lineData = lineData.concat(lineSegment[0].map((x, index) => ({ x: x, y: lineSegment[1][index] })))
                 });
                 lineData = lineData.concat([previousX,currentLineX[0],currentLineX[0], currentTime].map((x, index) => ({ x: x, y: [previousY,previousY,lastValue,lastValue][index] })))

            } else {
                 lineData = lineData.concat([currentLineX[0],currentTime].map((x, index) => ({ x: x, y: [lastValue,lastValue][index] })))

            }
           myChart.data.datasets[1].data = lineData;
           myChart.update();
        }
       }
        setTimeout(updatePlot,10)
    }
  }

   function reset() {
      isRunning = false;
      timerLabel.textContent = "00:00:00.000";
      xValues = [];
      yValues = [];
      lineSegments = [];
      currentLineX = [];
      lastValue = null;
      previousX = null;
      previousY = null;
      lastDotValue = null;
      lastProcessedValue = null;
       myChart.data.datasets = [{
                label: 'Pain Level',
                data: [],
                pointBackgroundColor: 'blue',
                 showLine: false
            },
            {
                type: 'line',
                label: 'Line',
                data: [],
                borderColor: 'black',
                borderWidth: 2,
                 pointRadius: 0,
                 fill: false,
                 tension:0
             }]
      myChart.update()

}


    // --- Button Event Listeners ---
    startStopButton.addEventListener('click', toggleTimer);
    resetButton.addEventListener('click', reset);
});