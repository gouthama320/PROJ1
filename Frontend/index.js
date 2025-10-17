// ✅ Keep only ONE signup event listener
document.addEventListener('DOMContentLoaded', function() {
    const signupBtn = document.querySelector("#signup-btn");
    signupBtn.addEventListener("click", () => {
        const first_name = document.querySelector("#signup-firstname").value.trim();
        const last_name = document.querySelector("#signup-lastname").value.trim();
        const age = document.querySelector("#signup-age").value.trim();
        const salary = document.querySelector("#signup-salary").value.trim();
        const username = document.querySelector("#signup-username").value.trim();
        const password = document.querySelector("#signup-password").value.trim();

        if (!first_name || !last_name || !age || !salary || !username || !password) {
            alert("Please fill out all fields.");
            return;
        }

        fetch("http://localhost:5050/addUser", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, first_name, last_name, age, salary })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("User created successfully!");
                document.querySelector("#signup-firstname").value = "";
                document.querySelector("#signup-lastname").value = "";
                document.querySelector("#signup-age").value = "";
                document.querySelector("#signup-salary").value = "";
                document.querySelector("#signup-username").value = "";
                document.querySelector("#signup-password").value = "";
            } else {
                alert("Error: " + (data.error || "Unknown error"));
            }
        })
        .catch(err => console.error("Signup error:", err));
    });
});

// Login page event listener for username & password input fields
document.addEventListener("DOMContentLoaded", function() {
    const loginBtn = document.querySelector("#login-btn");
    const loggedInSection = document.querySelector("#logged-in-section");
    const loggedInMessage = document.querySelector("#logged-in-message");
    const logoutBtn = document.querySelector("#logout-btn");

    // Show/hide the logout button and logged in message based on user login status
    function updateUI() {
        const currentUser = localStorage.getItem("loggedInUser");
        console.log(currentUser);
        if (currentUser) {
            loggedInSection.style.display = "block";
            loggedInMessage.textContent = `You are logged in, ${currentUser}!`;
        } else {
            loggedInSection.style.display = "none";
        }
    }

    // Check the login in status on page load
    updateUI();

    // Log out button event listen
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("loggedInUser");
        updateUI();
    });
    
    loginBtn.addEventListener("click", () => {
        const username = document.querySelector("#user-input").value.trim();
        const password = document.querySelector("#pass-input").value.trim();

        if (!username || !password) {
            alert("The username and/or password was not entered.");
            return;
        }

        fetch("http://localhost:5050/loginUser", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                localStorage.setItem("loggedInUser", username); // If login is successful, keep the user logged in
                updateUI();

            // Clear login input fields
            document.querySelector("#user-input").value = "";
            document.querySelector("#pass-input").value = "";
            } else {
                alert("Login failed: " + (data.error || "Unknown username or password"));
            }
        })
        .catch(err => console.error("Login error:", err));
    });
});