document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("token");
    const loggedIn = localStorage.getItem("loggedIn");
    
    console.log("🔍 Checking if user is already authenticated...");
    console.log("loggedIn:", loggedIn);
    console.log("Stored Token:", token);
    
    if (loggedIn === "true" && token) {
        try {
            const response = await fetch("http://localhost:5001/auth/verify", {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` }
            });
            
            const data = await response.json();
            console.log("🔹 Auth Check Response:", data);
            
            if (response.ok) {
                console.log("✅ User authentication confirmed. Redirecting to dashboard...");
                window.location.href = "dashboard.html";
                return;
            }
        } catch (error) {
            console.error("❌ Auth check failed:", error);
        }
    }
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
                    
                    // Save token, user info, and set loggedIn flag
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("userName", data.user?.name || "Unknown");
                    localStorage.setItem("userEmail", data.user?.email || "Unknown");
                    localStorage.setItem("loggedIn", "true"); // Force set loggedIn
                    
                    console.log("✅ Stored in localStorage:");
                    console.log("loggedIn:", localStorage.getItem("loggedIn"));
                    console.log("token:", localStorage.getItem("token"));

                    alert("Login successful!");
                    setTimeout(() => {
                        window.location.href = "dashboard.html"; // Wait a moment before redirecting
                    }, 500);
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

    const token = localStorage.getItem("token");
    const loggedIn = localStorage.getItem("loggedIn");
    
    console.log("🔍 Checking if user is already authenticated...");
    console.log("loggedIn:", loggedIn);
    console.log("Stored Token:", token);
    
    if (loggedIn === "true" && token) {
        console.log("✅ User already authenticated. Redirecting to dashboard...");
        window.location.href = "dashboard.html";
        return;
    }