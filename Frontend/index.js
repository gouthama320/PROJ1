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

// Userid search button event listener 
const useridSearchBtn =  document.querySelector('#useridSearch-btn');
useridSearchBtn.onclick = function (){
    const useridSearchInput = document.querySelector('#userid-search');
    const useridSearchValue = useridSearchInput.value;
    useridSearchValue.value = "";

    fetch('http://localhost:5050/search/' + useridSearchValue)
    .then(response => response.json())
    .then(data => searchResultsTable(data['data']));
}

// Users that never logged in search button event listener 
const nullLoginSearchBtn =  document.querySelector('#nullLoginSearch-btn');
nullLoginSearchBtn.onclick = function (){
    fetch('http://localhost:5050/nullLogin')
    .then(response => response.json())
    .then(data => searchResultsTable(data['data']));
}

// Users that signed up today search button event listener 
const signupTodaySearchBtn =  document.querySelector('#signupTodaySearch-btn');
signupTodaySearchBtn.onclick = function (){
    fetch('http://localhost:5050/signupToday')
    .then(response => response.json())
    .then(data => searchResultsTable(data['data']));
}

function searchResultsTable(data){
    const table = document.querySelector('table tbody'); 
    
    if(data.length === 0){
        table.innerHTML = "<tr><td class='no-data' colspan='8'>No Data</td></tr>";
        return;
    }

    let tableHtml = "";
    data.forEach(function ({username, password, first_name, last_name, salary, age, signup_date, last_login}){
        tableHtml += "<tr>";
        tableHtml +=`<td>${username}</td>`;
        tableHtml +=`<td>${password}</td>`;
        tableHtml +=`<td>${first_name}</td>`;
        tableHtml +=`<td>${last_name}</td>`;
        tableHtml +=`<td>${salary}</td>`;
        tableHtml +=`<td>${age}</td>`;
        tableHtml +=`<td>${new Date(signup_date).toLocaleDateString()}</td>`; // Format signup_date as MM/DD/YYYY
        tableHtml += `<td>${last_login ? new Date(last_login).toLocaleString() : 'NULL'}</td>`; // Format last_login as MM/DD/YYYY, HH:MM:SS AM/PM
        tableHtml += "</tr>";
    });

    table.innerHTML = tableHtml;
}