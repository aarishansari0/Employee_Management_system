// ==========================
// JWT PARSER
// ==========================
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

// ==========================
// INIT
// ==========================
window.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const token = localStorage.getItem('token');

  // ==========================
  // AUTO LOGIN (IF TOKEN EXISTS)
  // ==========================
  if (token) {
    const decoded = parseJwt(token);

    if (decoded?.role === "admin") {
      window.electronAPI.load_next_page('admin');
    } else {
      window.electronAPI.loginSuccess(); // home
    }
    return;
  }

  // ==========================
  // LOGIN SUBMIT
  // ==========================
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const company_id = document.getElementById('company_id').value.trim();

    if (!username || !password || !company_id) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await fetch('https://hermes-ib9a.onrender.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, company_id, password })
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error || "Login failed");
        return;
      }

      if (!data.token) {
        alert("Token missing from server");
        return;
      }

      // ✅ Save token
      localStorage.setItem('token', data.token);

      const decoded = parseJwt(data.token);

      // ==========================
      // ROLE BASED REDIRECT
      // ==========================
      if (decoded?.role === "admin") {
        window.electronAPI.load_next_page('admin');
      } else {
        window.electronAPI.loginSuccess(); // home.html
      }

    } catch (err) {
      console.error("Login error:", err);
      alert("Server error. Try again.");
    }
  });
});