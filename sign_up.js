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
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signup-link');
  const token = localStorage.getItem('token');

  // ==========================
  // AUTO LOGIN IF TOKEN EXISTS
  // ==========================
  if (token) {
    const decoded = parseJwt(token);

    if (decoded?.role === "admin") {
      window.electronAPI.load_next_page('admin');
    } else {
      window.electronAPI.loginSuccess();
    }
    return;
  }
 
  // ==========================
  // SIGNIUP SUBMIT
  // ==========================
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const company_id = document.getElementById('company_id').value.trim();
    const passkey = document.getElementById('passkey').value.trim();
    const role = document.getElementById('role').value; // ✅ NEW

    if (!username || !password || !company_id) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const res = await fetch('https://hermes-ib9a.onrender.com/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, 
          company_id, 
          passkey, 
          password,
          role   // ✅ SEND ROLE
        })
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error || "Signup failed");
        return;
      }

      localStorage.setItem('token', data.token);

      const decoded = parseJwt(data.token);

      if (decoded?.role === "admin") {
        window.electronAPI.load_next_page('admin');
      } else {
        window.electronAPI.loginSuccess();
      }

    } catch (err) {
      console.error("Signup error:", err);
      alert("Server error");
    }
  })
})