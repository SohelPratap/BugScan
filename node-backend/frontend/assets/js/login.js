document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("loginForm");
    const loading = document.getElementById("loading");

    if (form) {
        form.addEventListener("submit", async function (e) {
            e.preventDefault();

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();

            if (!email || !password) {
                alert("Please fill in all fields.");
                return;
            }

            loading.style.display = "flex";
            form.style.display = "none";

            try {
                const data = await API.login(email, password);

                if (data.token) {
                    // Save to localStorage
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("userName", data.user.name);
                    localStorage.setItem("userEmail", data.user.email);
                    localStorage.setItem("userId", data.user.id);
                    localStorage.setItem("loggedIn", "true");

                    alert("✅ Login successful!");
                    window.location.href = "dashboard.html";
                } else {
                    alert("❌ Error: " + (data.error || "Login failed."));
                    loading.style.display = "none";
                    form.style.display = "block";
                }
            } catch (error) {
                console.error("Login error:", error);
                alert("❌ Login failed. Please try again later.");
                loading.style.display = "none";
                form.style.display = "block";
            }
        });
    }
});