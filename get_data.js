const jwt = localStorage.getItem('token');

window.addEventListener('DOMContentLoaded', () => {
  const welcomeMsg = document.getElementById('welcome-message');
  const dataDisplay = document.getElementById('data_body'); // tbody

  welcomeMsg.textContent = `Welcome!`;

  document.getElementById('back').addEventListener('click', () => {
    console.log("Navigating back to home page");
    window.electronAPI.load_next_page('home');
  });

  loadTasks();

  // Event delegation for delete buttons
  dataDisplay.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-btn')) {
      const taskId = e.target.getAttribute('data-id');

      if (confirm("Are you sure you want to delete this task?")) {
        try {
          const res = await fetch("http://localhost:3000/delete_task", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${jwt}`
            },
            body: JSON.stringify({ id: taskId })
          });

          const result = await res.json();
          if (result.success) {
            alert("Task deleted successfully");
            loadTasks(); // refresh the table
          } else {
            alert("Error deleting task: " + result.error);
          }
        } catch (err) {
          console.error("Delete error:", err);
          alert("Failed to delete task");
        }
      }
    }
  });
});

async function loadTasks() {
  const dataDisplay = document.getElementById('data_body');

  try {
    const res = await fetch("http://localhost:3000/get_data", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`
      }
    });

    const data = await res.json();
    console.log("Server response:", data);

    if (data.success) {
      dataDisplay.innerHTML = '';

      data.tasks.forEach(task => {
        const startTime = `${String(task.startHour).padStart(2,'0')}:${String(task.startMinute).padStart(2,'0')} ${task.startPeriod}`;
        const endTime = `${String(task.endHour).padStart(2,'0')}:${String(task.endMinute).padStart(2,'0')} ${task.endPeriod}`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${task.username}</td>
          <td>${startTime}</td>
          <td>${endTime}</td>
          <td>${task.note || ''}</td>
          <td><button class="delete-btn" data-id="${task._id}">Delete</button></td>
        `;
        dataDisplay.appendChild(tr);
      });
    } else {
      dataDisplay.innerHTML = `<tr><td colspan="5">Failed to load tasks.</td></tr>`;
    }
  } catch (err) {
    console.error("Fetch error:", err);
    dataDisplay.innerHTML = `<tr><td colspan="5">Error connecting to server.</td></tr>`;
  }
}
