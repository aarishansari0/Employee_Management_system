const BASE_URL = "https://hermes-ib9a.onrender.com";

// ==========================
// INIT
// ==========================
window.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Login required");
    return;
  }

  loadProfile();

  const backBtn = document.getElementById("back");
  if (backBtn) {
    backBtn.addEventListener("click", goBack);
  }
});


// ==========================
// LOAD PROFILE
// ==========================
async function loadProfile() {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/profile`, {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.error || "Failed to load profile");
      return;
    }

    const user = data.user;

    // Fill fields
    document.getElementById("username").value = user.username || "";
    document.getElementById("email").value = user.email || "";
    document.getElementById("phone").value = user.phone || "";
    document.getElementById("bossEmail").value = user.bossEmail || "";

    document.getElementById("joinedAt").value =
      user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : "";

    document.getElementById("status").value = user.status || "";

  } catch (err) {
    console.error("Profile load error:", err);
    alert("Error loading profile");
  }
}


// ==========================
// SAVE PROFILE
// ==========================
async function saveProfile() {
  try {
    const token = localStorage.getItem("token");

    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const bossEmail = document.getElementById("bossEmail").value.trim();

    // 🔍 Basic validation
    if (email && !validateEmail(email)) {
      alert("Invalid email format");
      return;
    }

    if (bossEmail && !validateEmail(bossEmail)) {
      alert("Invalid boss email");
      return;
    }

    const res = await fetch(`${BASE_URL}/update_profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({
        email,
        phone,
        bossEmail
      })
    });

    const data = await res.json();

    if (data.success) {
      alert("Profile updated successfully!");
    } else {
      alert(data.error || "Update failed");
    }

  } catch (err) {
    console.error("Save error:", err);
    alert("Error saving profile");
  }
}


// ==========================
// EMAIL VALIDATION
// ==========================
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}


// ==========================
// NAVIGATION
// ==========================
function goBack() {
  window.electronAPI.load_next_page('home');
}