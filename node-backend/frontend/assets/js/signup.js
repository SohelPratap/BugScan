document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("signupForm");
    const loading = document.getElementById("loading");

    if (form) {
        form.addEventListener("submit", async function (e) {
            e.preventDefault();

            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            const confirmPassword = document.getElementById("confirmPassword").value.trim();

            // Validation
            if (!name || !email || !password) {
                alert("Please fill in all fields.");
                return;
            }

            if (password.length < 6) {
                alert("Password must be at least 6 characters.");
                return;
            }

            if (password !== confirmPassword) {
                alert("Passwords do not match.");
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert("Please enter a valid email.");
                return;
            }

            loading.style.display = "flex";
            form.style.display = "none";

            try {
                const data = await API.register(name, email, password);

                if (data.message && data.message.includes("successfully")) {
                    alert("✅ Account created successfully! Please login.");
                    window.location.href = "login.html";
                } else {
                    alert("❌ Error: " + (data.error || "Sign up failed."));
                    loading.style.display = "none";
                    form.style.display = "block";
                }
            } catch (error) {
                console.error("Signup error:", error);
                alert("❌ Sign up failed. Please try again later.");
                loading.style.display = "none";
                form.style.display = "block";
            }
        });
    }
});