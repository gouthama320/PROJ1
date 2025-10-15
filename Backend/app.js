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

// create
app.post('/insert', (request, response) => {
    console.log("app: insert a row.");
    const {name} = request.body;
    const db = dbService.getDbServiceInstance();

    const result = db.insertNewName(name);
 
    result 
    .then(data => response.json({data: data}))
    .catch(err => console.log(err));
});

// read 
app.get('/getAll', (request, response) => {
    const db = dbService.getDbServiceInstance();
    const result =  db.getAllData(); 
    result
    .then(data => response.json({data: data}))
    .catch(err => console.log(err));
});

app.get('/search/:name', (request, response) => {
    const {name} = request.params;
    console.log(name);

    const db = dbService.getDbServiceInstance();

    let result;
    if(name === "all")
       result = db.getAllData()
    else 
       result =  db.searchByName(name); 

    result
    .then(data => response.json({data: data}))
    .catch(err => console.log(err));
});

// update
app.patch('/update', (request, response) => {
    console.log("app: update is called");
    const{id, name} = request.body;
    const db = dbService.getDbServiceInstance();

    const result = db.updateNameById(id, name);

    result.then(data => response.json({success: true}))
    .catch(err => console.log(err)); 
});

// delete service
app.delete('/delete/:id', (request, response) => {     
    const {id} = request.params;
    console.log("delete");
    console.log(id);
    const db = dbService.getDbServiceInstance();

    const result = db.deleteRowById(id);

    result.then(data => response.json({success: true}))
    .catch(err => console.log(err));
});  

// add new user with first_name, last_name, age, salary
app.post('/addUser', (request, response) => {
    console.log("app: addUser called.");
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

app.post("/loginUser", (request, response) => {
    console.log("app: loginUser called.");
    const { username, password } = request.body;
    const db = dbService.getDbServiceInstance();

    const result = db.loginUser(username, password);

    result
      .then(data => response.json(data))
      .catch(err => console.log(err));
});

// if we configure here directly
app.listen(5050, () => {
    console.log("I am listening on the fixed port 5050.")
});
