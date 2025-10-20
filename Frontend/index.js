document.addEventListener("DOMContentLoaded", function() {
    const inputFields = document.querySelectorAll("input");
    inputFields.forEach(input => input.value = ""); // Clear all input fields on page reload

    // Sign up implementation
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

    // Login page implementation
    const loginBtn = document.querySelector("#login-btn");
    const profileToggle = document.querySelector("#profile-toggle");
    const logoutBtn = document.querySelector("#logout-btn");

    // Show/hide the profile section based on user login status, hide logout button by default
    function updateUI() {
        const currentUser = localStorage.getItem("loggedInUser");
        const authSection = document.querySelector("#auth-section");
        const profileSection = document.querySelector("#profile-section");
        const profileName = document.querySelector("#profile-name");
        const queriesSection = document.querySelector("#queries-section");
        const queryResults = document.querySelector("#query-results");
        const queryBody = document.querySelector('#query-results tbody');

        if (currentUser) {
            authSection.style.display = "none"; // Hide Sign Up & Login sections when logged in
            profileSection.style.display = "flex"; // Show the profile section (with a flex display style)
            queriesSection.style.display = "grid"; // Show the queries section (with a grid display style, 2 rows of 4)
            profileName.textContent = currentUser; // Set the profile name in the profile section to the logged in username
            logoutBtn.style.display = "none"; // Hide the logout button by default when logged in
            queryResults.style.display = "none"; // Hide the query results table, until a query is made
            if (queryBody) queryBody.innerHTML = ''; // Clear the query results table on login
        } else {
            authSection.style.display = "block"; // Show Sign Up & Login section when not logged in
            profileSection.style.display = "none"; // Hide the profile section
            queriesSection.style.display = "none"; // Hide the queries section
            queryResults.style.display = "none"; // Hide the query results table
            if (queryBody) queryBody.innerHTML = ''; // Clear the query results table on sign out 
        }
    }

    // Check the login status on page load
    updateUI();
    
    // Login button event listener
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

    // Page document event listener for toggling off the logout button when clicking outside the profile section
    document.addEventListener("click", () => {
        logoutBtn.style.display = "none";
    });

    // Profile section event listener, clicking the profile section (with the icon & username) toggles the logout button
    profileToggle.addEventListener("click", (event) => {
        event.stopPropagation(); // Exception to the document event listener above since the profile section should toggle the logout button
        logoutBtn.style.display = logoutBtn.style.display === "none" ? "inline-block" : "none";
    });
    
    // Logout button event listener
    logoutBtn.addEventListener("click", () => {
        alert("User logged out successfully!");
        localStorage.removeItem("loggedInUser");
        updateUI();
    });
});

// Userid search
const useridSearchBtn =  document.querySelector('#useridSearch-btn');
useridSearchBtn.onclick = function (){
    const useridSearchValue = document.querySelector('#userid-search').value.trim();
    
    if(!useridSearchValue) {
        alert("Userid search input field is empty.");
        return;
    }

    fetch('http://localhost:5050/searchUserId/' + useridSearchValue)
    .then(response => response.json())
    .then(data => {
        searchResultsTable(data['data'], ['username', 'salary', 'age', 'signup_date', 'last_login'])
        document.querySelector("#userid-search").value = ""
    })
    .catch(err => console.error("Userid search error:", err));
}

// Users between age range search
const ageSearchBtn = document.querySelector('#ageSearch-btn');
ageSearchBtn.onclick = function () {
    const minAge = document.querySelector('#minAge-search').value.trim();
    const maxAge = document.querySelector('#maxAge-search').value.trim();

    if(!minAge || !maxAge) {
        alert("Age range search input field(s) are empty.");
        return;
    }

    fetch(`http://localhost:5050/ageRangeSearch?minAge=${minAge}&maxAge=${maxAge}`)
    .then(response => response.json())
    .then(data => {
        searchResultsTable(data['data'], ['username', 'first_name', 'last_name', 'age'])
        document.querySelector("#minAge-search").value = ""
        document.querySelector("#maxAge-search").value = ""
    })
    .catch(err => console.error("Age range search error:", err));
};

// Users that never logged in search
const nullLoginSearchBtn =  document.querySelector('#nullLoginSearch-btn');
nullLoginSearchBtn.onclick = function () {
    fetch('http://localhost:5050/nullLogin')
    .then(response => response.json())
    .then(data => searchResultsTable(data['data'], ['username', 'first_name', 'last_name', 'last_login']))
    .catch(err => console.error("Users not logged in search error:", err));
}

// Users that signed up today search
const signupTodaySearchBtn =  document.querySelector('#signupTodaySearch-btn');
signupTodaySearchBtn.onclick = function () {
    fetch('http://localhost:5050/signupToday')
    .then(response => response.json())
    .then(data => searchResultsTable(data['data'], ['username', 'first_name', 'last_name', 'signup_date']))
    .catch(err => console.error("Users signed up today search error:", err));
}

// Search by first and/or last name
const nameSearchBtn = document.querySelector('#nameSearch-btn');
nameSearchBtn.onclick = function () {
    const firstName = document.querySelector('#firstName-search').value.trim();
    const lastName = document.querySelector('#lastName-search').value.trim();

    if(!firstName || !lastName) {
        alert("First and/or last name search input field(s) are empty.");
        return;
    }

    fetch(`http://localhost:5050/searchByName?first_name=${firstName}&last_name=${lastName}`)
    .then(response => response.json())
    .then(data => {
        searchResultsTable(data['data'], ['first_name', 'last_name'])
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

    if(!minSalary || !maxSalary) {
        alert("Salary range search input field(s) are empty.");
        return;
    }

    fetch(`http://localhost:5050/searchBySalaryRange?minSalary=${minSalary}&maxSalary=${maxSalary}`)
    .then(response => response.json())
    .then(data => {
        searchResultsTable(data['data'], ['username', 'first_name', 'last_name', 'salary'])
        document.querySelector("#minSalary-search").value = ""
        document.querySelector("#maxSalary-search").value = ""
    })
    .catch(err => console.error("Users salary range search error:", err));
};

// Search users registered after John (userid)
const afterUserSearchBtn = document.querySelector('#afterUserSearch-btn');
afterUserSearchBtn.onclick = function () {
    const userid = document.querySelector('#afterUser-search').value.trim();

    if(!userid) {
        alert("After user registration search input field is empty.");
        return;
    }

    fetch(`http://localhost:5050/searchRegisteredAfter/${userid}`)
    .then(response => response.json())
    .then(data => {
        searchResultsTable(data['data'], ['username', 'first_name', 'last_name', 'signup_date'])
        document.querySelector("#afterUser-search").value = ""
    })
    .catch(err => console.error("Users registered after john search error:", err));
};

// Search users registered same day as John (userid)
const sameDayUserSearchBtn = document.querySelector('#sameDayUserSearch-btn');
sameDayUserSearchBtn.onclick = function () {
    const userid = document.querySelector('#sameDayUser-search').value.trim();
    
    if(!userid) {
        alert("Same day user registration search input field is empty.");
        return;
    }

    fetch(`http://localhost:5050/searchRegisteredSameDay/${userid}`)
    .then(response => response.json())
    .then(data => {
        searchResultsTable(data['data'], ['username', 'first_name', 'last_name', 'signup_date'])
        document.querySelector("#sameDayUser-search").value = ""
    })
    .catch(err => console.error("Users registered after john search error:", err));
};

// Function for showing query results in a table that differs in what columns are shown
function searchResultsTable(query_data, columnsToShow = []) {
    const queryResults = document.querySelector("#query-results");
    const queryTableHead = document.querySelector('#query-results thead'); 
    const queryTableBody = document.querySelector('#query-results tbody');

    // Show the query results table, the idea is to only show when any of the search buttons (that call this function) are clicked
    queryResults.style.display = "table";

    // Prevent previous results to prevent leftover columns in queries with no results
    queryTableHead.innerHTML = "";
    queryTableBody.innerHTML = "";

    // If the query does not have a result, indicate this through HTML text
    if (query_data.length === 0) {
        queryTableBody.innerHTML = "<h2>No results for the query</h2>";
        return;
    }

    // Build query search results table header
    queryTableHead.innerHTML = `
    <tr>${columnsToShow.map(col => `<th>${col}</th>`).join('')}</tr>`; // Array of HTML column name strings is joined into a single string without commas

    // Build query search results table body
    // Array of HTML row result strings is joined into a single string without commas
    queryTableBody.innerHTML = query_data.map(row => `
    <tr>
        ${columnsToShow.map(col => { // Nested mapping of HTML column results
            let value = row[col]; // Set row results of each column
            if (col === 'signup_date' && value)
                // Format signup_date as MM/DD/YYYY
                value = new Date(value).toLocaleDateString();
            if (col === 'last_login')
                // Ternary operation to format last_login as "MM/DD/YYYY, HH:MM:SS AM/PM" for users that have signed in or "NULL" if not
                value = value ? new Date(value).toLocaleString() : 'NULL';
            return `<td>${value}</td>`; // Return a mapped row result of a mapped column
        }).join('')}
    </tr>
    `).join('');
}