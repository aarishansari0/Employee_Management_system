const BASE_URL = "https://hermes-ib9a.onrender.com";
const token = localStorage.getItem("token");

if (!token) {
  alert("Login required");
}

// ==========================
// LOAD LOGS
// ==========================
async function loadLogs() {
  const tbody = document.getElementById("logs");

  const userFilter = document.getElementById("userFilter").value.trim().toLowerCase();
  const actionFilter = document.getElementById("actionFilter").value;
  const fromDate = document.getElementById("fromDate").value;
  const toDate = document.getElementById("toDate").value;

  tbody.innerHTML = `
    <tr>
      <td colspan="4" class="empty">Loading logs...</td>
    </tr>
  `;

  try {
    const res = await fetch(`${BASE_URL}/admin/logs`, {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    if (!res.ok) {
      throw new Error("Failed request");
    }

    const data = await res.json();

    if (!data.success || !data.logs) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="empty">Failed to load logs</td>
        </tr>
      `;
      return;
    }

    let logs = data.logs;

    // ==========================
    // FILTERING
    // ==========================
    logs = logs.filter(log => {

      if (!log.username || !log.time) return false;

      if (userFilter && !log.username.toLowerCase().includes(userFilter)) {
        return false;
      }

      if (actionFilter !== "all" && log.action !== actionFilter) {
        return false;
      }

      const logDate = new Date(log.time);

      if (fromDate && logDate < new Date(fromDate)) return false;

      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        if (logDate > end) return false;
      }

      return true;
    });

    // ==========================
    // RENDER
    // ==========================
    if (logs.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="empty">No logs found</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = "";

    logs.forEach(log => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${log.username}</td>
        <td class="log-${log.action || "unknown"}">
          ${log.action || "unknown"}
        </td>
        <td>${log.message || "-"}</td>
        <td>${new Date(log.time).toLocaleString()}</td>
      `;

      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("Log fetch error:", err);

    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="empty">Server error</td>
      </tr>
    `;
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