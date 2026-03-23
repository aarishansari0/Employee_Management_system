  window.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const jwt= localStorage.getItem('token')

    if (jwt){
      window.electronAPI.loginSuccess();
    }

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;
      const company_id = document.getElementById('company_id').value;

      if (!username || !password || !company_id) {
        alert("Please enter everything");
        return;
      }

      try {
        const res = await fetch('https://hermes-ib9a.onrender.com/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, company_id, password })
        });

        const data = await res.json();

        if (data.success) {
          if (!data.token) return res.json({success: false, error:"token is empty"})
          localStorage.setItem('token', data.token);
          window.electronAPI.loginSuccess();
        } else {
          alert(data.error || 'Login failed');
        }
      } catch (err) {
        console.error('Login error:', err);
        alert("An error occurred while trying to log in.");
      }
    });

  });
