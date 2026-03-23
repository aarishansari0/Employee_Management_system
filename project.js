const token = localStorage.getItem('token');
const BASE_URL = "https://hermes-ib9a.onrender.com";
const jwt= localStorage.getItem('token')

window.addEventListener('DOMContentLoaded', () => {
  loadProjects();
});

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('back').addEventListener('click', () => {
    console.log("Navigating back to home page");
    window.electronAPI.load_next_page('home');
  });
  while(!jwt){}
  fetchChartData();
});

function openAddModal() {
  document.getElementById("projectModal").classList.remove("hidden");
}

document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("projectModal").classList.add("hidden");
});

document.getElementById("saveProject").addEventListener("click", async () => {

  const name = document.getElementById("projectName").value;
  const team = document.getElementById("projectTeam").value;
  const deadline = document.getElementById("projectDeadline").value;

  if (!name || !team) return;

  await createProject(name, team, deadline);

  document.getElementById("projectModal").classList.add("hidden");

  document.getElementById("projectName").value = "";
  document.getElementById("projectTeam").value = "";
  document.getElementById("projectDeadline").value = "";
});

async function createProject(name, team, deadline) {
  await fetch("https://hermes-ib9a.onrender.com/add_project", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      name,
      team_name: team,
      deadline
    })
  });

  loadProjects();
}

async function loadProjects() {
  try {
    const res = await fetch(`${BASE_URL}/projects`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    if (!data.success) return;

    document.querySelectorAll('.cards').forEach(el => el.innerHTML = "");
    data.projects.forEach(project => {

    // Define valid statuses
    const validStatuses = ['todo', 'in_progress', 'completed'];

    // Fallback if status is invalid
    let status = project.status;
    if (!validStatuses.includes(status)) {
        console.warn("Invalid status:", status, "→ defaulting to todo");
        status = 'todo';
    }

    const column = document.querySelector(`#${status} .cards`);

    if (!column) {
        console.error("Column not found for status:", status);
        return;
    }

    const card = createCard(project);
    column.appendChild(card);

    });

  } catch (err) {
    console.error("Load error:", err);
  }
}

function createCard(project) {
  const div = document.createElement('div');
  div.className = "card";

  div.innerHTML = `
    <strong>${project.name}</strong><br>
    Team: ${project.team_name}<br>
    Due: ${project.deadline ? project.deadline.split('T')[0] : "N/A"}<br>

    <select onchange="updateStatus('${project._id}', this.value)">
      <option value="todo" ${project.status === "todo" ? "selected" : ""}>To Do</option>
      <option value="in_progress" ${project.status === "in_progress" ? "selected" : ""}>In Progress</option>
      <option value="completed" ${project.status === "completed" ? "selected" : ""}>Completed</option>
    </select>

    <button onclick="deleteProject('${project._id}')">Delete</button>
  `;

  return div;
}

async function updateStatus(id, status) {
  await fetch(`${BASE_URL}/update_project/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });

  loadProjects();
}

async function deleteProject(id) {
  await fetch(`${BASE_URL}/delete_project/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  loadProjects();
}