

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signup-link');

  const jwt = localStorage.getItem('token');
  if (jwt) {
    window.electronAPI.loginSuccess();
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const company_id = document.getElementById('company_id').value.trim();
    const passkey = document.getElementById('passkey').value.trim();

    console.log(username, passkey,password,company_id)

    // Basic validation
    if (!username || !password || !company_id) {
      alert("Please fill all required fields");
      return;
    }

    const url = 'http://localhost:3000/signup'

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, company_id, passkey, password })
      });

      const data = await res.json();

      if (data.success) {
        if (!data.token) {
          alert("Token missing from server");
          return;
        }

        localStorage.setItem('token', data.token);
        window.electronAPI.loginSuccess();
      } else {
        alert(data.error || (isSignup ? 'Signup failed' : 'Login failed'));
      }

    } catch (err) {
      console.error('Auth error:', err);
      alert("Server error. Try again.");
    }
  });
});