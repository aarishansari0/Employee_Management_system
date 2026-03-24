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
// LOAD TASKS
// ==========================
async function loadTasks() {
  const tbody = document.getElementById("data_body");

  const username = document.getElementById("userFilter").value || "all";
  const fromDate = document.getElementById("fromDate").value;
  const toDate = document.getElementById("toDate").value;

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
        task.startHour,
        task.startMinute,
        task.startPeriod
      );

      const end = toMinutes(
        task.endHour,
        task.endMinute,
        task.endPeriod
      );

      let durationMin = end - start;
      if (durationMin < 0) durationMin += 1440;

      totalMinutes += durationMin;
      activeUsers.add(task.username);

      const tr = document.createElement("tr");

      // 🔥 Highlight long work (>8h)
      if (durationMin > 480) {
        tr.style.background = "#2e1a1a";
      }

      tr.innerHTML = `
        <td>${task.username}</td>
        <td>${new Date(task.date).toISOString().split("T")[0]}</td>
        <td>${task.startHour}:${String(task.startMinute).padStart(2,'0')} ${task.startPeriod}</td>
        <td>${task.endHour}:${String(task.endMinute).padStart(2,'0')} ${task.endPeriod}</td>
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
// LOAD USERS
// ==========================
async function loadUsers() {
  const select = document.getElementById("userFilter");

  select.innerHTML = `<option value="all">All Employees</option>`;

  try {
    const res = await fetch("https://hermes-ib9a.onrender.com/team_page", {
      headers: { Authorization: "Bearer " + jwt }
    });

    const data = await res.json();

    const users = new Set();

    if (data.teams && data.teams.length > 0) {
      data.teams.forEach(team => {
        team.members?.forEach(m => {
          if (m.name) users.add(m.name);
        });
      });
    }

    // fallback
    if (users.size === 0) {
      const res2 = await fetch("https://hermes-ib9a.onrender.com/get_data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + jwt
        },
        body: JSON.stringify({ username: "all" })
      });

      const data2 = await res2.json();
      data2.tasks?.forEach(t => users.add(t.username));
    }

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