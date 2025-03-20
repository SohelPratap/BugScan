document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            const inputs = form.querySelectorAll("input");
            let isValid = true;

            inputs.forEach(input => {
                if (input.value.trim() === "") {
                    isValid = false;
                    alert("Please fill in all fields.");
                }
            });

            if (isValid) {
                if (form.id === "loginForm") {
                    alert("Login successful!");
                } else if (form.id === "signupForm") {
                    alert("Signup successful!");
                }
            }
        });
    }
});
