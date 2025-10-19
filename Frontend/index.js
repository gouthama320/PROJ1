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
    const profileSection = document.querySelector("#profile-section");
    const profileName = document.querySelector("#profile-name");
    const profileToggle = document.querySelector("#profile-toggle");
    const logoutBtn = document.querySelector("#logout-btn");

    // Show/hide the profile section based on user login status, hide logout button by default
    function updateUI() {
        const currentUser = localStorage.getItem("loggedInUser");
        const authSection = document.querySelector("#auth-section");
        const profileSection = document.querySelector("#profile-section");
        const searchSection = document.querySelector("#search-section");

        if (currentUser) {
            authSection.style.display = "none";
            profileSection.style.display = "flex";
            searchSection.style.display = "block";
            profileName.textContent = currentUser;
            logoutBtn.style.display = "none";
        } else {
            authSection.style.display = "block";
            profileSection.style.display = "none";
            searchSection.style.display = "none";
        }
    }

    // Check the login in status on page load
    updateUI();

    // Clicking the profile section (with the icon & username) toggles the logout button
    profileToggle.addEventListener("click", () => {
    logoutBtn.style.display =
        logoutBtn.style.display === "none" ? "inline-block" : "none";
    });
    
    // Log out button event listener
    logoutBtn.addEventListener("click", () => {
        alert("User logged out successfully!");
        localStorage.removeItem("loggedInUser");
        updateUI();
    });
    
    // Log in button event listener
    loginBtn.addEventListener("click", () => {
        const username = document.querySelector("#user-input").value;
        const password = document.querySelector("#pass-input").value;

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
                alert("User logged in successfully!");
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

    fetch('http://localhost:5050/searchUserId/' + useridSearchValue)
    .then(response => response.json())
    .then(data => {
        searchResultsTable(data['data'])
        document.querySelector("#userid-search").value = ""
    })
    .catch(err => console.error("Userid search error:", err));
}

// Users between age range event listener
const ageSearchBtn = document.querySelector('#ageSearch-btn');
ageSearchBtn.onclick = function () {
    const minAge = document.querySelector('#minAge-search').value.trim();
    const maxAge = document.querySelector('#maxAge-search').value.trim();

    fetch(`http://localhost:5050/ageRangeSearch?minAge=${minAge}&maxAge=${maxAge}`)
    .then(response => response.json())
    .then(data => {
        searchResultsTable(data['data'])
        document.querySelector("#minAge-search").value = ""
        document.querySelector("#maxAge-search").value = ""
    })
    .catch(err => console.error("Age range search error:", err));
};

// Users that never logged in search button event listener 
const nullLoginSearchBtn =  document.querySelector('#nullLoginSearch-btn');
nullLoginSearchBtn.onclick = function (){
    fetch('http://localhost:5050/nullLogin')
    .then(response => response.json())
    .then(data => searchResultsTable(data['data']))
    .catch(err => console.error("Users not logged in search error:", err));
}

// Users that signed up today search button event listener 
const signupTodaySearchBtn =  document.querySelector('#signupTodaySearch-btn');
signupTodaySearchBtn.onclick = function (){
    fetch('http://localhost:5050/signupToday')
    .then(response => response.json())
    .then(data => searchResultsTable(data['data']))
    .catch(err => console.error("Users signed up today search error:", err));
}

// Search by first and/or last name
const nameSearchBtn = document.querySelector('#nameSearch-btn');
nameSearchBtn.onclick = function () {
    const firstName = document.querySelector('#firstName-search').value.trim();
    const lastName = document.querySelector('#lastName-search').value.trim();

    fetch(`http://localhost:5050/searchByName?first_name=${firstName}&last_name=${lastName}`)
    .then(response => response.json())
    .then(data => {
        searchResultsTable(data['data'])
        document.querySelector("#firstName-search").value = ""
        document.querySelector("#lastName-search").value = ""
    })
    .catch(err => console.error("Users first and/or last name search error:", err));
};

// Search users whose salary is between X and Y
const salarySearchBtn = document.querySelector('#salarySearch-btn');
salarySearchBtn.onclick = function () {
    const minSalary = document.querySelector('#minSalary-search').value.trim();
    const maxSalary = document.querySelector('#maxSalary-search').value.trim();

    fetch(`http://localhost:5050/searchBySalaryRange?minSalary=${minSalary}&maxSalary=${maxSalary}`)
    .then(response => response.json())
    .then(data => {
        searchResultsTable(data['data'])
        document.querySelector("#minSalary-search").value = ""
        document.querySelector("#maxSalary-search").value = ""
    })
    .catch(err => console.error("Users salary range search error:", err));
};

// Search users registered after John (userid)
const afterUserSearchBtn = document.querySelector('#afterUserSearch-btn');
afterUserSearchBtn.onclick = function () {
    const userid = document.querySelector('#afterUser-search').value.trim();

    fetch(`http://localhost:5050/searchRegisteredAfter/${userid}`)
    .then(response => response.json())
    .then(data => {
        searchResultsTable(data['data'])
        document.querySelector("#afterUser-search").value = ""
    })
    .catch(err => console.error("Users registered after john search error:", err));
};

// Search users registered same day as John (userid)
const sameDayUserSearchBtn = document.querySelector('#sameDayUserSearch-btn');
sameDayUserSearchBtn.onclick = function () {
    const userid = document.querySelector('#sameDayUser-search').value.trim();

    fetch(`http://localhost:5050/searchRegisteredSameDay/${userid}`)
    .then(response => response.json())
    .then(data => {
        searchResultsTable(data['data'])
        document.querySelector("#sameDayUser-search").value = ""
    })
    .catch(err => console.error("Users registered after john search error:", err));
};

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
        // Format signup_date as MM/DD/YYYY
        tableHtml +=`<td>${new Date(signup_date).toLocaleDateString()}</td>`;
        // Ternary operation to format last_login as "MM/DD/YYYY, HH:MM:SS AM/PM" for users that have signed in or "NULL" if not
        tableHtml += `<td>${last_login ? new Date(last_login).toLocaleString() : 'NULL'}</td>`;
        tableHtml += "</tr>";
    });

    table.innerHTML = tableHtml;
}