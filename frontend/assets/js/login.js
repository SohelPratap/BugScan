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
                console.log("🔹 API Response:", data); // Log API response for debugging

                if (response.ok && data.token) {
                    console.log("✅ Login successful! Token received:", data.token);
                    
                    // Save token and user info
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("userName", data.user.name);
                    localStorage.setItem("userEmail", data.user.email);
                    
                    console.log("✅ Token and user info saved in localStorage:", localStorage.getItem("token"));

                    alert("Login successful!");
                    window.location.href = "dashboard.html"; // Redirect after login
                } else {
                    console.error("❌ Login error:", data.error || "No token received");
                    alert("Error: " + (data.error || "Login failed."));
                }
            } catch (error) {
                console.error("❌ Login failed:", error);
                alert("Login failed. Please try again later.");
            }
        });
    }
});
