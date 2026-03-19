let workChart = null;
const jwt= localStorage.getItem('token')


window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('back').addEventListener('click', () => {
    console.log("Navigating back to home page");
    window.electronAPI.load_next_page('home');
  });
  while(!jwt){}
  fetchChartData();
});


function fetchChartData() {
  const title = document.getElementById('chart-title');

  fetch('http://localhost:3000/task-summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json','Authorization': `Bearer ${jwt}` }
  })
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        title.textContent = "Failed to load chart";
        console.error("Chart load error:", data.error);
        return;
      }
      else{
        console.log("Chart response:", data);
        console.log("Labels:", data.data.map(d => d.date));
        console.log("Minutes:", data.data.map(d => d.minutes));

      }

      const labels = data.data.map(d => d.date);
      const minutes = data.data.map(d => d.minutes);

      if (labels.length === 0) {
        title.textContent = "No task data available";
        return;
      }

      title.textContent = "Work Summary (Last 7 Days)";
      const ctx = document.getElementById('workChart').getContext('2d');

      if (workChart) {
        workChart.destroy(); // ✅ safe now
      }

      workChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Minutes Worked',
            data: minutes,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderRadius: 5,
            barThickness: 40
          }]
        },
        options: {
          responsive: false,
          plugins: {
            legend: {
              display: true
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              suggestedMax: Math.max(...minutes) + 50,
              title: {
                display: true,
                text: 'Minutes'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Date'
              }
            }
          }
        }
      });
    })
    .catch(err => {
      title.textContent = "Error loading chart";
      console.error("Fetch error:", err);
    });
}
