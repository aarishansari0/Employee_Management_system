const token = localStorage.getItem('token');
const BASE_URL = "https://hermes-ib9a.onrender.com";

window.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector("form");
  const backBtn = document.getElementById("back");

  // Handle form submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const requestType = document.getElementById("requestType").value;
    const title = document.getElementById("title").value.trim();
    const details = document.getElementById("details").value.trim();
    const startDate = document.getElementById("startDate").value.trim();
    const endDate = document.getElementById("endDate").value.trim();

    if (!title || !details) {
      alert("Please fill required fields.");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/add_request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          requestType,
          title,
          details,
          startDate,
          endDate
        })
      });

      const data = await res.json();

      if (data.success) {
        alert("Request submitted successfully!");
        form.reset();
      } else {
        alert(data.error || "Failed to submit request.");
      }

    } catch (err) {
      console.error("Request error:", err);
      alert("Server error.");
    }
  });

  // Back button
  backBtn.addEventListener("click", () => {
    window.electronAPI.load_next_page('home');
  });
});