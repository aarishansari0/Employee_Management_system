const token = localStorage.getItem("token");

window.addEventListener("DOMContentLoaded", loadReport);

async function loadReport() {
  const res = await fetch("https://hermes-ib9a.onrender.com/admin/report", {
    headers: {
      Authorization: "Bearer " + token
    }
  });

  const data = await res.json();

  if (!data.success) {
    alert("Failed to load report");
    return;
  }

  renderOverview(data.overview);
  renderEmployees(data.employees);
  renderTeams(data.teams);
}

// 📘 PAGE 1
function renderOverview(overview) {
  document.getElementById("overview").innerHTML = `
    <p>Total Employees: ${overview.totalEmployees}</p>
    <p>Total Hours: ${overview.totalHours}</p>
    <p>Total Tasks: ${overview.totalTasks}</p>
  `;
}

// 📊 PAGE 2
function renderEmployees(employees) {
  const tbody = document.getElementById("employeeTable");

  employees.forEach(emp => {
    const hours = (emp.minutes / 60).toFixed(1);

    let status = "Inactive";
    if (hours >= 6) status = "Active";
    else if (hours >= 2) status = "Low";

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${emp.username}</td>
      <td>${hours}</td>
      <td>${emp.tasks}</td>
      <td>${status}</td>
    `;

    tbody.appendChild(tr);
  });
}

// 🧑‍🤝‍🧑 PAGE 3
function renderTeams(teams) {
  const tbody = document.getElementById("teamTable");

  teams.forEach(team => {
    const hours = (team.minutes / 60).toFixed(1);

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${team.name}</td>
      <td>${team.members}</td>
      <td>${hours}</td>
      <td>${team.projects}</td>
    `;

    tbody.appendChild(tr);
  });
}