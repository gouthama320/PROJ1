// Backend: application services, accessible by URLs

const express = require('express')
const cors = require ('cors')
const dotenv = require('dotenv')
const path = require('path');
dotenv.config()

const app = express();

const dbService = require('./dbService');

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended: false}));

// Serve the frontend by manually defining the Frontend folder path
app.use(express.static(path.join(__dirname, '../Frontend')));

// add new user with first_name, last_name, age, salary
app.post('/addUser', (request, response) => {
    const { first_name, last_name, age, salary, username, password } = request.body;
    const db = dbService.getDbServiceInstance();

    const result = db.insertNewUser(first_name, last_name, age, salary, username, password);

    result
      .then(data => response.json({ success: true, data }))
      .catch(err => {
          console.error(err);
          response.status(500).json({ success: false, error: err.message });
      });
});

// Login the user given a correct username and password combination
app.post("/loginUser", (request, response) => {
    const { username, password } = request.body;
    const db = dbService.getDbServiceInstance();

    const result = db.loginUser(username, password);

    result
      .then(data => response.json(data))
      .catch(err => console.log(err));
});

// Search users by userid (username)
app.get('/searchUserId/:userid', (request, response) => {
    const {userid} = request.params;
    const db = dbService.getDbServiceInstance();

    const result =  db.userIdSearch(userid); 

    result
    .then(data => response.json({data: data}))
    .catch(err => console.log(err));
});

// Search users by age range
app.get('/ageRangeSearch', (request, response) => {
    const {minAge, maxAge} = request.query;
    const db = dbService.getDbServiceInstance();

    const result =  db.ageRangeSearch(minAge, maxAge); 

    result
    .then(data => response.json({data: data}))
    .catch(err => console.log(err));
});

// Search users that haven't signed in. "request" is unused, must be a parameter so "response" isn't mistaken for a request and throws an error
app.get('/nullLogin', (request, response) => {
    const db = dbService.getDbServiceInstance();

    const result =  db.nullLoginSearch(); 

    result
    .then(data => response.json({data: data}))
    .catch(err => console.log(err));
});

// Search users that signed up today
app.get('/signupToday', (request, response) => {
    const db = dbService.getDbServiceInstance();

    const result =  db.registeredTodaySearch(); 

    result
    .then(data => response.json({data: data}))
    .catch(err => console.log(err));
});

// 🔍 Search users by first and/or last name
app.get('/searchByName', (request, response) => {
    const { first_name, last_name } = request.query;
    const db = dbService.getDbServiceInstance();

    const result = db.searchByName(first_name, last_name);

    result
        .then(data => response.json({ data: data }))
        .catch(err => console.log(err));
});

// 💰 Search users whose salary is between X and Y
app.get('/searchBySalaryRange', (request, response) => {
    const { minSalary, maxSalary } = request.query;
    const db = dbService.getDbServiceInstance();

    const result = db.searchBySalaryRange(minSalary, maxSalary);

    result
        .then(data => response.json({ data: data }))
        .catch(err => console.log(err));
});

// 🕓 Search users registered after John (userid)
app.get('/searchRegisteredAfter/:userid', (request, response) => {
    const { userid } = request.params;
    const db = dbService.getDbServiceInstance();

    const result = db.searchRegisteredAfterUser(userid);

    result
        .then(data => response.json({ data: data }))
        .catch(err => console.log(err));
});

// 📅 Search users registered same day as John (userid)
app.get('/searchRegisteredSameDay/:userid', (request, response) => {
    const { userid } = request.params;
    const db = dbService.getDbServiceInstance();

    const result = db.searchRegisteredSameDayUser(userid);

    result
        .then(data => response.json({ data: data }))
        .catch(err => console.log(err));
});

// Listen on the fixed port: 5050
app.listen(5050, () => {
});
