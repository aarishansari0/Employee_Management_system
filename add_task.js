
const jwt= localStorage.getItem('token')



function toMinutes(hour, minute, period) {
  hour = parseInt(hour);
  minute = parseInt(minute);
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  return hour * 60 + minute;
}

document.addEventListener('DOMContentLoaded', () => {

  document.getElementById('back').addEventListener('click', () => {
    window.electronAPI.load_next_page('home');
  });
  document.getElementById('task-form').addEventListener('submit', async(e) => {
    e.preventDefault();
    const note = document.getElementById('note').value;
    const date = document.getElementById('task-date').value;
    if (!date) {
      alert("Please select a date for the task.");
      return;
    }

    const start = {
      hour: document.getElementById('start-hour').value,
      minute: document.getElementById('start-minute').value,
      period: document.getElementById('start-period').value
    };

    const end = {
      hour: document.getElementById('end-hour').value,
      minute: document.getElementById('end-minute').value,
      period: document.getElementById('end-period').value
    };
    console.log(jwt)
    const res= await fetch('http://localhost:3000/add_task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` },
      body: JSON.stringify({
        start: start,
        end: end,
        note: note,
        date: new Date(date)
      })

    });
    const data = await res.json();
    if (data.success) {
      console.log('Task added successfully');
      alert('Task added successfully');
      window.electronAPI.loginSuccess();
    } else {
      console.error('Error adding task:', data.error);
      if (data.conflict) {
        alert(`Conflict with existing task:\nStart: ${data.conflict.start}\nEnd: ${data.conflict.end}\nNote: ${data.conflict.note}`);
      } else {
        alert(`Error adding task: ${data.error}`);
      }
    }

  })
});