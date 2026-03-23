const apiUrl = 'https://hermes-ib9a.onrender.com/team_page'; // Replace with your actual API
const jwt= localStorage.getItem('token')

// ==========================
// ADD TEAM (FIX)
// ==========================

let selectedMembers = [];

function addMember() {
  const input = document.getElementById("memberInput");
  const username = input.value.trim();

  if (!username) return;

  // prevent duplicates
  if (selectedMembers.includes(username)) {
    alert("Member already added");
    return;
  }

  selectedMembers.push(username);
  input.value = "";

  renderMembers();
}

function removeMember(username) {
  selectedMembers = selectedMembers.filter(m => m !== username);
  renderMembers();
}

function renderMembers() {
  const container = document.getElementById("memberList");
  container.innerHTML = "";

  selectedMembers.forEach(username => {
    const chip = document.createElement("div");
    chip.className = "member-chip";

    chip.innerHTML = `
      ${username}
      <span onclick="removeMember('${username}')">✕</span>
    `;

    container.appendChild(chip);
  });
}

async function loadUsers() {
  const token = localStorage.getItem("token");

  const res = await fetch("https://hermes-ib9a.onrender.com/team_page", {
    headers: { Authorization: "Bearer " + token }
  });

  const data = await res.json();

  const select = document.getElementById("teamMembersInput");
  select.innerHTML = "";

  const added = new Set();

  data.teams.forEach(team => {
    team.members.forEach(member => {
      if (!added.has(member.name)) {
        added.add(member.name);

        const option = document.createElement("option");
        option.value = member.name;
        option.textContent = member.name;

        select.appendChild(option);
      }
    });
  });
}


function openAddTeamModal() {
  document.getElementById("teamModal").classList.remove("hidden");
  loadUsers(); // 🔥 importants
}

function closeTeamModal() {
  document.getElementById("teamModal").classList.add("hidden");
}

async function createTeam() {
  const name = document.getElementById("teamNameInput").value;
  const token = localStorage.getItem("token");

  if (!name) {
    alert("Enter team name");
    return;
  }

  const res = await fetch("https://hermes-ib9a.onrender.com/add_team", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({
      name,
      members: selectedMembers
    })
  });

  const data = await res.json();

  if (data.success) {
    alert("Team created!");
    selectedMembers = []; // reset
    location.reload();
  } else {
    alert(data.error || "Failed");
  }
}

document.getElementById("memberInput").addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    addMember();
  }
});

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('back').addEventListener('click', () => {
    console.log("Navigating back to home page");
    window.electronAPI.load_next_page('home');
  });
  while(!jwt){}
  fetchChartData();
});

async function deleteTeam(teamName) {
  const token = localStorage.getItem('token');

  if (!confirm(`Delete team "${teamName}"?`)) return;

  const response = await fetch('https://hermes-ib9a.onrender.com/delete_team', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ teamName })
  });

  const data = await response.json();

  if (data.success) {
    location.reload();
  } else {
    alert(data.error || "Failed to delete");
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error("No token found");
      return;
    }

    const response = await fetch('https://hermes-ib9a.onrender.com/team_page', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    const data = await response.json();
    console.log("TEAM PAGE DATA:", data);

    if (!data.success) {
      console.error("API returned failure");
      return;
    }

    const teams = data.teams;
    const projects = data.projects;

    document.getElementById('teamsCount').textContent = teams.length;
    const uniqueMembers = new Set();

    teams.forEach(team => {
      team.members.forEach(m => uniqueMembers.add(m.name));
    });

    document.getElementById('membersCount').textContent = uniqueMembers.size;

    document.getElementById('activeProjects').textContent =
      projects.filter(p => p.status !== 'completed').length;

    const teamContainer = document.getElementById('teamList');
    teamContainer.innerHTML = '';

    teams.forEach(team => {
        const teamCard = document.createElement('div');
        teamCard.className = 'team-card';

        teamCard.innerHTML = `
        <div class="team-header">
            <h3>${team.name}</h3>
            <button class="delete-btn" onclick="deleteTeam('${team.name}')">
            Delete
            </button>
        </div>

        <p><strong>Lead:</strong> ${team.lead}</p>

        <div class="members">
            ${team.members.map(m =>
            `<span class="member">${m.initials} ${m.name} (${m.role})</span>`
            ).join('')}
        </div>

        <p><strong>Projects:</strong> ${team.projectCount}</p>
        `;

        teamContainer.appendChild(teamCard);
    });

    const tbody = document.getElementById('projectTableBody');
    tbody.innerHTML = '';

    projects.forEach(project => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>${project.name}</td>
        <td>${project.team}</td>
        <td><span class="status ${project.status}">${project.status}</span></td>
        <td>${project.due || '-'}</td>
      `;

      tbody.appendChild(tr);
    });

  } catch (error) {
    console.error('Error loading team page:', error);
  }
});