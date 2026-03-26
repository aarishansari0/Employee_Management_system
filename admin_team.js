const BASE_URL = "https://hermes-ib9a.onrender.com";
const token = localStorage.getItem("token");

let selectedMembers = [];

// ==========================
// LOAD TEAMS
// ==========================
async function loadTeams() {
  const res = await fetch(`${BASE_URL}/team_page`, {
    headers: { Authorization: "Bearer " + token }
  });

  const data = await res.json();

  const container = document.getElementById("teamList");
  container.innerHTML = "";

  data.teams.forEach(team => {
    const div = document.createElement("div");
    div.className = "team-card";

    div.innerHTML = `
      <h3>${team.name}</h3>
      <p><b>Lead:</b> ${team.lead}</p>

      <div>
        ${team.members.map(m => `
          <span class="member">
            ${m.name}
            <button onclick="removeMemberFromTeam('${team.name}', '${m.name}')">❌</button>
          </span>
        `).join("")}
      </div>

      <br>

      <input placeholder="Add member..." id="add-${team.name}">
      <button onclick="addMemberToTeam('${team.name}')">Add</button>

      <br><br>

      <input placeholder="New lead username" id="lead-${team.name}">
      <button onclick="changeLead('${team.name}')">Change Lead</button>

      <br><br>

      <button onclick="deleteTeam('${team.name}')" style="background:red">Delete Team</button>
    `;

    container.appendChild(div);
  });
}

// ==========================
// CREATE TEAM
// ==========================
function openAddTeamModal() {
  document.getElementById("teamModal").classList.remove("hidden");
}

function closeTeamModal() {
  document.getElementById("teamModal").classList.add("hidden");
}

function addMember() {
  const input = document.getElementById("memberInput");
  const username = input.value.trim();

  if (!username) return;

  if (!selectedMembers.includes(username)) {
    selectedMembers.push(username);
  }

  input.value = "";
  renderMembers();
}

function renderMembers() {
  const container = document.getElementById("memberList");
  container.innerHTML = "";

  selectedMembers.forEach(user => {
    container.innerHTML += `
      <span class="member">
        ${user}
        <button onclick="removeTempMember('${user}')">❌</button>
      </span>
    `;
  });
}

function removeTempMember(user) {
  selectedMembers = selectedMembers.filter(u => u !== user);
  renderMembers();
}

async function createTeam() {
  const name = document.getElementById("teamNameInput").value;

  const res = await fetch(`${BASE_URL}/add_team`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({
      name,
      members: selectedMembers
    })
  });

  const data = await res.json();

  if (data.success) {
    alert("Team created");
    location.reload();
  } else {
    alert(data.error);
  }
}

// ==========================
// ADD MEMBER
// ==========================
async function addMemberToTeam(teamName) {
  const input = document.getElementById(`add-${teamName}`);
  const username = input.value.trim();

  if (!username) return;

  await fetch(`${BASE_URL}/add_member`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ teamName, username })
  });

  loadTeams();
}

// ==========================
// REMOVE MEMBER
// ==========================
async function removeMemberFromTeam(teamName, username) {
  await fetch(`${BASE_URL}/remove_member`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ teamName, username })
  });

  loadTeams();
}

// ==========================
// CHANGE LEAD
// ==========================
async function changeLead(teamName) {
  const input = document.getElementById(`lead-${teamName}`);
  const newLead = input.value.trim();

  if (!newLead) return;

  await fetch(`${BASE_URL}/change_lead`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ teamName, newLead })
  });

  loadTeams();
}

// ==========================
// DELETE TEAM
// ==========================
async function deleteTeam(teamName) {
  if (!confirm("Delete team?")) return;

  await fetch(`${BASE_URL}/delete_team`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ teamName })
  });

  loadTeams();
}

// ==========================
// INIT
// ==========================
window.addEventListener("DOMContentLoaded", () => {
  loadTeams();

  document.getElementById("back")
    .addEventListener("click", () => {
      window.electronAPI.load_next_page("admin");
    });
});