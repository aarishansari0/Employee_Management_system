const jwt= localStorage.getItem('token')


window.addEventListener('DOMContentLoaded', () => {
  const welcomeMsg = document.getElementById('welcome-msg');
  if (welcomeMsg) {
    welcomeMsg.textContent = `Welcome!`;
  }
  const taskBtn = document.getElementById('task_page');
  const dataBtn = document.getElementById('get_data');
  const chartBtn = document.getElementById('chart_page');
  const teamBtn= document.getElementById('team_page');
  const  requestBtn=document.getElementById('request_page');
  const projectBtn=document.getElementById('project_page');
  const logoutBtn=document.getElementById('logout')
  const profileBtn=document.getElementById('profile_page');
  const adminBtn=document.getElementById('admin');




  if (taskBtn) {
    taskBtn.addEventListener('click', () => {
      console.log("Navigating to: add_task");
      window.electronAPI.load_next_page('add_task');
    });
  }

  if (dataBtn) {
    dataBtn.addEventListener('click', () => {
      console.log("Navigating to: get_data");
      window.electronAPI.load_next_page('get_data');
    });
  }

  if (chartBtn) {
    chartBtn.addEventListener('click', () => {
      console.log("Navigating to: chart");
      window.electronAPI.load_next_page('chart');
    });
  }
  if (requestBtn) {
    requestBtn.addEventListener('click', () => {
      console.log("Navigating to: chart");
      window.electronAPI.load_next_page('request');
    });
  }
  if (teamBtn) {
    teamBtn.addEventListener('click', () => {
      console.log("Navigating to: team");
      window.electronAPI.load_next_page('team');
    });
  }

  if (projectBtn) {
    projectBtn.addEventListener('click', () => {
      console.log("Navigating to: project");
      window.electronAPI.load_next_page('project');
    });
  }
  
  if (chartBtn) {
    profileBtn.addEventListener('click', () => {
      console.log("Navigating to: profile");
      window.electronAPI.load_next_page('profile');
    });
  }

  if (adminBtn) {
    adminBtn.addEventListener('click', () => {
      console.log("Navigating to: profile");
      window.electronAPI.load_next_page('admin');
    });
  }

    if (logoutBtn){
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.electronAPI.load_next_page('index');
    });
  }

});
