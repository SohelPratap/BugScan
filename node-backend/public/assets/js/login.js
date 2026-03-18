document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("loginForm");
    const loading = document.getElementById("loading");
    const messageBox = document.getElementById("messageBox");

    function showMessage(text, type) {
        messageBox.textContent = text;
        messageBox.className = "message-box " + type;
        messageBox.style.display = "block";
    }

    function clearMessage() {
        messageBox.style.display = "none";
        messageBox.textContent = "";
        messageBox.className = "message-box";
    }

    // Toggle password visibility
    const togglePassword = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("password");
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener("click", function () {
            const isHidden = passwordInput.type === "password";
            passwordInput.type = isHidden ? "text" : "password";
            togglePassword.classList.toggle("fa-eye", !isHidden);
            togglePassword.classList.toggle("fa-eye-slash", isHidden);
        });
    }

    if (form) {
        form.addEventListener("submit", async function (e) {
            e.preventDefault();
            clearMessage();

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;

            if (!email || !password) {
                showMessage("Please fill in all fields.", "error");
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showMessage("Please enter a valid email address.", "error");
                return;
            }

            loading.style.display = "flex";
            form.style.display = "none";

            try {
                const data = await API.login(email, password);

                localStorage.setItem("token", data.token);
                localStorage.setItem("userName", data.user.name);
                localStorage.setItem("userEmail", data.user.email);
                localStorage.setItem("userId", data.user.id);
                localStorage.setItem("loggedIn", "true");

                loading.style.display = "none";
                form.style.display = "block";
                showMessage("✅ Login successful! Redirecting…", "success");
                setTimeout(() => { window.location.href = "dashboard.html"; }, 800);
            } catch (error) {
                console.error("Login error:", error);
                loading.style.display = "none";
                form.style.display = "block";
                showMessage("❌ " + getAPIErrorMessage(error), "error");
            }
        });
    }
});