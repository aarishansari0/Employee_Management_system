// CREATE TEAM
document.getElementById('createTeamForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('teamName').value;
  const token = localStorage.getItem('token');

  const response = await fetch('http://localhost:3000/add_team', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
      name,
      members: []  // empty for now
    })
  });

  const data = await response.json();
  console.log("TEAM CREATE:", data);

  location.reload(); // refresh dashboard
});


// CREATE PROJECT
document.getElementById('createProjectForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('projectName').value;
  const team_name = document.getElementById('projectTeam').value;
  const progress = parseInt(document.getElementById('projectProgress').value) || 0;
  const token = localStorage.getItem('token');

  const response = await fetch('http://localhost:3000/add_project', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
      name,
      team_name,
      progress,
      status: "in-progress"
    })
  });

  const data = await response.json();
  console.log("PROJECT CREATE:", data);

  location.reload();
});