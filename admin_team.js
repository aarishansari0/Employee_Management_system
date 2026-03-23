const token = localStorage.getItem("token");
const BASE_URL = "https://hermes-ib9a.onrender.com";

// 🚀 INIT
window.addEventListener("DOMContentLoaded", () => {
  loadTeams();

  document.getElementById("back").addEventListener("click", () => {
    window.electronAPI.load_next_page("home");
  });
});

// 📦 LOAD TEAMS
async function loadTeams() {
  try {
    const res = await fetch(`${BASE_URL}/team_page`, {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    const data = await res.json();

    if (!data.success) return alert("Failed to load teams");

    const container = document.getElementById("teamList");
    container.innerHTML = "";

    data.teams.forEach(team => {
      const div = document.createElement("div");
      div.className = "team-card";

      div.innerHTML = `
        <h3>${team.name}</h3>

        <!-- 🔥 CHANGE LEAD -->
        <p>
          <strong>Lead:</strong>
          <select onchange="changeLead('${team.name}', this.value)">
            ${team.members.map(m => `
              <option value="${m.name}" ${m.name === team.lead ? "selected" : ""}>
                ${m.name}
              </option>
            `).join("")}
          </select>
        </p>

        <!-- 👥 MEMBERS -->
        <div>
          ${team.members.map(m => `
            <span class="member-chip">
              ${m.name}
              <span onclick="removeMember('${team.name}', '${m.name}')">✕</span>
            </span>
          `).join("")}
        </div>

        <!-- ➕ ADD MEMBER -->
        <div class="member-input">
          <input type="text" id="add-${team.name}" placeholder="Add member...">
          <button onclick="addMember('${team.name}')">Add</button>
        </div>

        <button onclick="deleteTeam('${team.name}')">Delete Team</button>
        <hr>
      `;

      container.appendChild(div);
    });

  } catch (err) {
    console.error("Load teams error:", err);
  }
}

// 🔥 CHANGE LEAD
async function changeLead(teamName, newLead) {
  const res = await fetch(`${BASE_URL}/change_lead`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ teamName, newLead })
  });

  const data = await res.json();

  if (!data.success) {
    alert("Failed to update lead");
  }
}

// ➕ ADD MEMBER
async function addMember(teamName) {
  const input = document.getElementById(`add-${teamName}`);
  const username = input.value.trim();

  if (!username) return;

  const res = await fetch(`${BASE_URL}/add_member`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ teamName, username })
  });

  const data = await res.json();

  if (data.success) {
    loadTeams();
  } else {
    alert("Failed to add member");
  }
}

// ❌ REMOVE MEMBER
async function removeMember(teamName, username) {
  if (!confirm(`Remove ${username}?`)) return;

  const res = await fetch(`${BASE_URL}/remove_member`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ teamName, username })
  });

  const data = await res.json();

  if (data.success) {
    loadTeams();
  } else {
    alert("Failed to remove member");
  }
}

// 🗑 DELETE TEAM
async function deleteTeam(teamName) {
  if (!confirm(`Delete team ${teamName}?`)) return;

  const res = await fetch(`${BASE_URL}/delete_team`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ teamName })
  });

  const data = await res.json();

  if (data.success) {
    loadTeams();
  } else {
    alert("Failed to delete team");
  }
}