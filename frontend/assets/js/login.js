document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("loginForm");

    if (form) {
        form.addEventListener("submit", async function (e) {
            e.preventDefault();

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();

            if (!email || !password) {
                alert("Please fill in all fields.");
                return;
            }

            const backendUrl = "http://localhost:5001"; // Ensure this matches your backend URL

            try {
                const response = await fetch(`${backendUrl}/auth/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    alert("Login successful!");
                    localStorage.setItem("token", data.token); // Store JWT token
                    window.location.href = "dashboard.html"; // Redirect after login
                } else {
                    alert("Error: " + data.error);
                }
            } catch (error) {
                console.error("Login failed:", error);
                alert("Login failed. Please try again later.");
            }
        });
    }
});
