const jwt = localStorage.getItem('token');

// 🔁 Convert time → minutes
function toMinutes(hour, minute, period) {
  hour = parseInt(hour);
  minute = parseInt(minute);
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  return hour * 60 + minute;
}

// 📊 Load tasks
async function loadTasks() {
  const tbody = document.getElementById("data_body");

  const username = document.getElementById("userFilter").value;
  const fromDate = document.getElementById("fromDate").value;
  const toDate = document.getElementById("toDate").value;

  try {
    const res = await fetch("https://hermes-ib9a.onrender.com/get_data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + jwt
      },
      body: JSON.stringify({
        username,
        fromDate,
        toDate
      })
    });

    const data = await res.json();

    if (!data.success) {
      tbody.innerHTML = `<tr><td colspan="7">Failed to load</td></tr>`;
      return;
    }

    tbody.innerHTML = "";

    let totalMinutes = 0;
    const activeUsers = new Set();

    data.tasks.forEach(task => {

      const start = toMinutes(task.startHour, task.startMinute, task.startPeriod);
      const end = toMinutes(task.endHour, task.endMinute, task.endPeriod);
      const durationMin = end - start;

      totalMinutes += durationMin;
      activeUsers.add(task.username);

      const duration = (durationMin / 60).toFixed(2) + " hrs";
      const date = new Date(task.date).toLocaleDateString();

      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${task.username}</td>
        <td>${date}</td>
        <td>${task.startHour}:${task.startMinute} ${task.startPeriod}</td>
        <td>${task.endHour}:${task.endMinute} ${task.endPeriod}</td>
        <td>${duration}</td>
        <td>${task.note || ''}</td>
        <td><button class="delete-btn" data-id="${task._id}">Delete</button></td>
      `;

      tbody.appendChild(tr);
    });

    // 📊 UPDATE SUMMARY
    document.getElementById("totalHours").textContent = (totalMinutes / 60).toFixed(1) + " hrs";
    document.getElementById("totalTasks").textContent = data.tasks.length;
    document.getElementById("activeUsers").textContent = activeUsers.size;

  } catch (err) {
    console.error("Error:", err);
  }
}

// 👥 Load users into dropdown
async function loadUsers() {
  const select = document.getElementById("userFilter");

  try {
    const res = await fetch("https://hermes-ib9a.onrender.com/team_page", {
      headers: {
        Authorization: "Bearer " + jwt
      }
    });

    const data = await res.json();

    const users = new Set();

    data.teams.forEach(team => {
      team.members.forEach(m => users.add(m.name));
    });

    users.forEach(user => {
      const option = document.createElement("option");
      option.value = user;
      option.textContent = user;
      select.appendChild(option);
    });

  } catch (err) {
    console.error("User load error:", err);
  }
}

// 🗑 DELETE TASK
async function deleteTask(id) {
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
}

// 🚀 INIT
window.addEventListener("DOMContentLoaded", () => {

  loadUsers();
  loadTasks();

  document.getElementById("applyFilters").addEventListener("click", loadTasks);

  document.getElementById("back").addEventListener("click", () => {
    window.electronAPI.load_next_page("home");
  });

  document.getElementById("data_body").addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
      const id = e.target.getAttribute("data-id");
      if (confirm("Delete this task?")) {
        deleteTask(id);
      }
    }
  });

});