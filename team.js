const apiUrl = 'http://localhost:3000/team_page'; // Replace with your actual API
const jwt= localStorage.getItem('token')

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('back').addEventListener('click', () => {
    console.log("Navigating back to home page");
    window.electronAPI.load_next_page('home');
  });
  while(!jwt){}
  fetchChartData();
});

async function deleteTeam(teamName) {
  const token = localStorage.getItem('token');

  if (!confirm(`Delete team "${teamName}"?`)) return;

  const response = await fetch('http://localhost:3000/delete_team', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ teamName })
  });

  const data = await response.json();

  if (data.success) {
    location.reload();
  } else {
    alert(data.error || "Failed to delete");
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error("No token found");
      return;
    }

    const response = await fetch('http://localhost:3000/team_page', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });

    const data = await response.json();
    console.log("TEAM PAGE DATA:", data);

    if (!data.success) {
      console.error("API returned failure");
      return;
    }

    const teams = data.teams;
    const projects = data.projects;

    document.getElementById('teamsCount').textContent = teams.length;

    document.getElementById('membersCount').textContent =
      teams.reduce((acc, t) => acc + t.members.length, 0);

    document.getElementById('activeProjects').textContent =
      projects.filter(p => p.status !== 'completed').length;

    const teamContainer = document.getElementById('teamList');
    teamContainer.innerHTML = '';

    teams.forEach(team => {
        const teamCard = document.createElement('div');
        teamCard.className = 'team-card';

        teamCard.innerHTML = `
        <div class="team-header">
            <h3>${team.name}</h3>
            <button class="delete-btn" onclick="deleteTeam('${team.name}')">
            Delete
            </button>
        </div>

        <p><strong>Lead:</strong> ${team.lead}</p>

        <div class="members">
            ${team.members.map(m =>
            `<span class="member">${m.initials} ${m.name} (${m.role})</span>`
            ).join('')}
        </div>

        <p><strong>Projects:</strong> ${team.projectCount}</p>
        `;

        teamContainer.appendChild(teamCard);
    });

    const tbody = document.getElementById('projectTableBody');
    tbody.innerHTML = '';

    projects.forEach(project => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>${project.name}</td>
        <td>${project.team}</td>
        <td><span class="status ${project.status}">${project.status}</span></td>
        <td>${project.due || '-'}</td>
      `;

      tbody.appendChild(tr);
    });

  } catch (error) {
    console.error('Error loading team page:', error);
  }
});