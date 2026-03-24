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
  const container = document.getElementById("teamList");

  try {
    const res = await fetch(`${BASE_URL}/team_page`, {
      headers: { Authorization: "Bearer " + token }
    });

    if (!res.ok) throw new Error("Failed request");

    const data = await res.json();

    if (!data.success) {
      container.innerHTML = "<p>Failed to load teams</p>";
      return;
    }

    if (data.teams.length === 0) {
      container.innerHTML = "<p>No teams found</p>";
      return;
    }

    container.innerHTML = "";

    data.teams.forEach(team => {
      const safeId = team.name.replace(/\s+/g, "-");

      const div = document.createElement("div");
      div.className = "team-card";

      div.innerHTML = `
        <h3>${team.name}</h3>

        <!-- 🔥 CHANGE LEAD -->
        <p>
          <strong>Lead:</strong>
          <select data-team="${team.name}" class="lead-select">
            ${team.members.map(m => `
              <option value="${m}" ${m === team.lead ? "selected" : ""}>
                ${m}
              </option>
            `).join("")}
          </select>
        </p>

        <!-- 👥 MEMBERS -->
        <div>
          ${team.members.map(m => `
            <span class="member-chip">
              ${m}
              <span class="remove-btn" data-team="${team.name}" data-user="${m}">✕</span>
            </span>
          `).join("")}
        </div>

        <!-- ➕ ADD MEMBER -->
        <div class="member-input">
          <input type="text" id="add-${safeId}" placeholder="Add member...">
          <button data-team="${team.name}" data-id="${safeId}" class="add-btn">Add</button>
        </div>

        <button class="delete-btn" data-team="${team.name}">Delete Team</button>
      `;

      container.appendChild(div);
    });

  } catch (err) {
    console.error("Load teams error:", err);
    container.innerHTML = "<p>Error loading teams</p>";
  }
}

// 🎯 EVENT DELEGATION (CLEAN WAY)
document.addEventListener("click", async (e) => {

  // ➕ ADD MEMBER
  if (e.target.classList.contains("add-btn")) {
    const teamName = e.target.dataset.team;
    const safeId = e.target.dataset.id;
    const input = document.getElementById(`add-${safeId}`);
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
      input.value = ""; // 🔥 clear
      loadTeams();
    } else {
      alert(data.error || "Failed to add member");
    }
  }

  // ❌ REMOVE MEMBER
  if (e.target.classList.contains("remove-btn")) {
    const teamName = e.target.dataset.team;
    const username = e.target.dataset.user;

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
  if (e.target.classList.contains("delete-btn")) {
    const teamName = e.target.dataset.team;

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
});

// 🔥 CHANGE LEAD (separate listener)
document.addEventListener("change", async (e) => {
  if (e.target.classList.contains("lead-select")) {
    const teamName = e.target.dataset.team;
    const newLead = e.target.value;

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
});