const jwt = localStorage.getItem('token');

if (!jwt) {
  alert("No token found. Please login again.");
}

// 🔁 Convert time → minutes
function toMinutes(hour, minute, period) {
  hour = parseInt(hour);
  minute = parseInt(minute);

  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;

  return hour * 60 + minute;
}

// ==========================
// LOAD TASKS (MAIN)
// ==========================
async function loadTasks() {
  const tbody = document.getElementById("data_body");

  const username = document.getElementById("userFilter").value || "all";
  const fromDate = document.getElementById("fromDate").value;
  const toDate = document.getElementById("toDate").value;

  console.log("🚀 FILTER:", { username, fromDate, toDate });

  tbody.innerHTML = `<tr><td colspan="7">Loading...</td></tr>`;

  try {
    const res = await fetch("https://hermes-ib9a.onrender.com/get_data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + jwt
      },
      body: JSON.stringify({ username, fromDate, toDate })
    });

    const data = await res.json();

    console.log("📦 TASK DATA:", data);

    if (!data.success) {
      tbody.innerHTML = `<tr><td colspan="7">Failed to load</td></tr>`;
      return;
    }

    if (!data.tasks || data.tasks.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7">No data found</td></tr>`;
      return;
    }

    tbody.innerHTML = "";

    let totalMinutes = 0;
    const activeUsers = new Set();

    data.tasks.forEach(task => {
      const start = toMinutes(
        task.start?.hour,
        task.start?.minute,
        task.start?.period
      );

      const end = toMinutes(
        task.end?.hour,
        task.end?.minute,
        task.end?.period
      );

      let durationMin = end - start;
      if (durationMin < 0) durationMin += 1440;

      totalMinutes += durationMin;
      activeUsers.add(task.username);

      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${task.username}</td>
        <td>${new Date(task.date).toISOString().split("T")[0]}</td>
        <td>$${task.start?.hour}:${String(task.start?.minute).padStart(2,'0')} ${task.start?.period}</td>
        <td>${task.end?.hour}:${String(task.end?.minute).padStart(2,'0')} ${task.end?.period}</td>
        <td>${(durationMin / 60).toFixed(2)} hrs</td>
        <td>${task.note || ''}</td>
        <td><button class="delete-btn" data-id="${task._id}">Delete</button></td>
      `;

      tbody.appendChild(tr);
    });

    document.getElementById("totalHours").textContent =
      (totalMinutes / 60).toFixed(1) + " hrs";

    document.getElementById("totalTasks").textContent =
      data.tasks.length;

    document.getElementById("activeUsers").textContent =
      activeUsers.size;

  } catch (err) {
    console.error("❌ LOAD ERROR:", err);
    tbody.innerHTML = `<tr><td colspan="7">Server error</td></tr>`;
  }
}

// ==========================
// LOAD USERS (FIXED + FALLBACK)
// ==========================
async function loadUsers() {
  const select = document.getElementById("userFilter");

  select.innerHTML = `<option value="all">All Employees</option>`;

  try {
    const res = await fetch("https://hermes-ib9a.onrender.com/team_page", {
      headers: { Authorization: "Bearer " + jwt }
    });

    const data = await res.json();

    console.log("👥 TEAM DATA:", data);

    const users = new Set();

    // ✅ NORMAL CASE
    if (data.teams && data.teams.length > 0) {
      data.teams.forEach(team => {
        if (team.members && team.members.length > 0) {
          team.members.forEach(m => {
            if (m.name) users.add(m.name);
          });
        }
      });
    }

    // 🚨 FALLBACK: If teams empty → extract from tasks
    if (users.size === 0) {
      console.warn("⚠️ No users from team API, fallback to tasks");

      const res2 = await fetch("https://hermes-ib9a.onrender.com/get_data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + jwt
        },
        body: JSON.stringify({ username: "all" })
      });

      const data2 = await res2.json();

      if (data2.tasks) {
        data2.tasks.forEach(t => users.add(t.username));
      }
    }

    console.log("✅ USERS:", [...users]);

    users.forEach(user => {
      const option = document.createElement("option");
      option.value = user;
      option.textContent = user;
      select.appendChild(option);
    });

  } catch (err) {
    console.error("❌ USER LOAD ERROR:", err);
  }
}

// ==========================
// DELETE TASK
// ==========================
async function deleteTask(id) {
  try {
    const res = await fetch("https://hermes-ib9a.onrender.com/delete_task", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + jwt
      },
      body: JSON.stringify({ id })
    });

    const data = await res.json();

    if (data.success) {
      loadTasks();
    } else {
      alert("Delete failed");
    }

  } catch (err) {
    console.error("Delete error:", err);
  }
}

// ==========================
// INIT
// ==========================
window.addEventListener("DOMContentLoaded", async () => {

  console.log("🔥 INIT START");

  await loadUsers();
  await loadTasks();

  document.getElementById("applyFilters")
    .addEventListener("click", loadTasks);

  document.getElementById("back")
    .addEventListener("click", () => {
      window.electronAPI.load_next_page("home");
    });

  document.getElementById("data_body")
    .addEventListener("click", (e) => {
      if (e.target.classList.contains("delete-btn")) {
        const id = e.target.getAttribute("data-id");

        if (confirm("Delete this task?")) {
          deleteTask(id);
        }
      }
    });

});