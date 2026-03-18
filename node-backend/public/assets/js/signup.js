document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("signupForm");
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

    const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    if (toggleConfirmPassword && confirmPasswordInput) {
        toggleConfirmPassword.addEventListener("click", function () {
            const isHidden = confirmPasswordInput.type === "password";
            confirmPasswordInput.type = isHidden ? "text" : "password";
            toggleConfirmPassword.classList.toggle("fa-eye", !isHidden);
            toggleConfirmPassword.classList.toggle("fa-eye-slash", isHidden);
        });
    }

    if (form) {
        form.addEventListener("submit", async function (e) {
            e.preventDefault();
            clearMessage();

            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirmPassword").value;

            if (!name || !email || !password || !confirmPassword) {
                showMessage("Please fill in all fields.", "error");
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showMessage("Please enter a valid email address (e.g. user@example.com).", "error");
                return;
            }

            if (password.length < 6) {
                showMessage("Password must be at least 6 characters.", "error");
                return;
            }

            if (password !== confirmPassword) {
                showMessage("Passwords do not match.", "error");
                return;
            }

            loading.style.display = "flex";
            form.style.display = "none";

            try {
                await API.register(name, email, password);

                loading.style.display = "none";
                form.style.display = "block";
                showMessage("✅ Account created successfully! Redirecting to login…", "success");
                setTimeout(() => { window.location.href = "login.html"; }, 1200);
            } catch (error) {
                console.error("Signup error:", error);
                loading.style.display = "none";
                form.style.display = "block";
                showMessage("❌ " + getAPIErrorMessage(error), "error");
            }
        });
    }
});