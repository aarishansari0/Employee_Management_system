const BASE_URL = "https://hermes-ib9a.onrender.com";
const token = localStorage.getItem("token");

if (!token) {
  alert("Login required");
}

// ==========================
// LOAD LOGS
// ==========================
async function loadLogs() {
  const container = document.getElementById("logContainer");

  const userFilter = document.getElementById("userFilter").value.trim().toLowerCase();
  const actionFilter = document.getElementById("actionFilter").value;
  const fromDate = document.getElementById("fromDate").value;
  const toDate = document.getElementById("toDate").value;

  container.innerHTML = `<div class="empty">Loading logs...</div>`;

  try {
    const res = await fetch(`${BASE_URL}/admin/logs`, {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    const data = await res.json();

    if (!data.success) {
      container.innerHTML = `<div class="empty">Failed to load logs</div>`;
      return;
    }

    let logs = data.logs;

    // ==========================
    // FILTERING
    // ==========================

    logs = logs.filter(log => {

      // user filter
      if (userFilter && !log.username.toLowerCase().includes(userFilter)) {
        return false;
      }

      // action filter
      if (actionFilter !== "all" && log.action !== actionFilter) {
        return false;
      }

      // date filter
      const logDate = new Date(log.time);

      if (fromDate && logDate < new Date(fromDate)) return false;

      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23,59,59,999);
        if (logDate > end) return false;
      }

      return true;
    });

    // ==========================
    // RENDER
    // ==========================

    if (logs.length === 0) {
      container.innerHTML = `<div class="empty">No logs found</div>`;
      return;
    }

    container.innerHTML = "";

    logs.forEach(log => {
      const div = document.createElement("div");
      div.className = "log-box";

      div.innerHTML = `
        <div class="log-header">
          <span class="log-user">${log.username}</span>
          <span class="log-action log-${log.action}">${log.action}</span>
        </div>

        <div class="log-message">${log.message || "-"}</div>

        <div class="log-time">
          ${new Date(log.time).toLocaleString()}
        </div>
      `;

      container.appendChild(div);
    });

  } catch (err) {
    console.error("Log fetch error:", err);
    container.innerHTML = `<div class="empty">Server error</div>`;
  }
}

// ==========================
// INIT
// ==========================
window.addEventListener("DOMContentLoaded", () => {

  loadLogs();

  document.getElementById("applyFilters")
    .addEventListener("click", loadLogs);

  document.getElementById("back")
    .addEventListener("click", () => {
      window.electronAPI.load_next_page("admin");
    });

});