const token = localStorage.getItem("token");

async function loadChart() {
  const res = await fetch("https://hermes-ib9a.onrender.com/admin/work-trend", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    }
  });

  const data = await res.json();
  if (!data.success) return alert("Failed");

  const raw = data.data;

  const dates = Object.keys(raw).sort();

  // get all employees
  const employees = new Set();
  dates.forEach(date => {
    Object.keys(raw[date]).forEach(user => employees.add(user));
  });

  // build datasets
  const datasets = [];

  employees.forEach(user => {
    const values = dates.map(date => raw[date][user] || 0);

    datasets.push({
      label: user,
      data: values,
      fill: false,
      tension: 0.3
    });
  });

  const ctx = document.getElementById("workTrendChart").getContext("2d");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: dates,
      datasets: datasets
    },
    options: {
      plugins: {
        legend: { display: true }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Minutes Worked"
          }
        },
        x: {
          title: {
            display: true,
            text: "Date"
          }
        }
      }
    }
  });
}

window.addEventListener("DOMContentLoaded", loadChart);