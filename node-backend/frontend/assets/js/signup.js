document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("signupForm");

    if (form) {
        form.addEventListener("submit", async function (e) {
            e.preventDefault();

            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();

            if (!name || !email || !password) {
                alert("Please fill in all fields.");
                return;
            }

            const backendUrl = "http://localhost:5001";

            try {
                const response = await fetch(backendUrl + "/auth/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    alert("Signup successful! Redirecting to login...");
                    window.location.href = "login.html"; // Redirect to login page
                } else {
                    alert("Error: " + data.error);
                }
            } catch (error) {
                console.error("Signup failed:", error);
                alert("Signup failed. Please try again later.");
            }
        });
    }
});
