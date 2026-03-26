const jwt= localStorage.getItem('token')


window.addEventListener('DOMContentLoaded', () => {
  const welcomeMsg = document.getElementById('welcome-msg');
  if (welcomeMsg) {
    welcomeMsg.textContent = `Welcome!`;
  }
  const taskBtn = document.getElementById('dashboard');
  const dataBtn = document.getElementById('employee_data');
  const admin_teamBtn = document.getElementById('admin_team');



  if (taskBtn) {
    taskBtn.addEventListener('click', () => {
      console.log("Navigating to: add_task");
      window.electronAPI.load_next_page('dashboard');
    });
  }

  if (dataBtn) {
    dataBtn.addEventListener('click', () => {
      console.log("Navigating to: get_data");
      window.electronAPI.load_next_page('employee_data');
    });
  }

  if (admin_teamBtn) {
    admin_teamBtn.addEventListener('click', () => {
      console.log("Navigating to: chart");
      window.electronAPI.load_next_page('admin_team');
    });
  }

});
