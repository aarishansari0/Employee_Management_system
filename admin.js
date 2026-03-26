const jwt= localStorage.getItem('token')


window.addEventListener('DOMContentLoaded', () => {
  const welcomeMsg = document.getElementById('welcome-msg');
  if (welcomeMsg) {
    welcomeMsg.textContent = `Welcome!`;
  }
  const taskBtn = document.getElementById('dashboard');
  const dataBtn = document.getElementById('employee_data');
  const admin_teamBtn = document.getElementById('admin_team');
  const admin_logsBtn = document.getElementById('admin_logs');


  const logoutBtn = document.getElementById('logout');




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
      console.log("Navigating to: team");
      window.electronAPI.load_next_page('admin_team');
    });
  }

  if (admin_logsBtn) {
    admin_logsBtn.addEventListener('click', () => {
      console.log("Navigating to: logs");
      window.electronAPI.load_next_page('admin_logs');
    });
  }

  if (logoutBtn){
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.electronAPI.load_next_page('index');
    });
  }

});
