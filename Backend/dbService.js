// database services, accessbile by DbService methods.

const mysql = require('mysql');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt'); // for password hashing
dotenv.config(); // read from .env file

let instance = null; 


// if you use .env to configure
console.log("HOST: " + process.env.DB_HOST);
console.log("DB USER: " + process.env.DB_USER);
console.log("PASSWORD: " + process.env.DB_PASSWORD);
console.log("DATABASE: " + process.env.DB_DATABASE);
console.log("DB PORT: " + process.env.DB_PORT);

const connection = mysql.createConnection({
     host: process.env.DB_HOST,
     user: process.env.DB_USER,        
     password: process.env.DB_PASSWORD,
     database: process.env.DB_DATABASE,
     port: process.env.DB_PORT
});

connection.connect((err) => {
     if(err){
        console.log(err.message);
     }
     console.log('db ' + connection.state);    // to see if the DB is connected or not
});

// the following are database functions, 

class DbService{
    static getDbServiceInstance(){ // only one instance is sufficient
        return instance? instance: new DbService();
    }

    async insertNewUser(first_name, last_name, age, salary, username, password) {
        
        try {
            // check if username exists
            const existing = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM users WHERE username = ?";
                connection.query(query, [username], (err, results) => {
                    if(err) reject(err);
                    else resolve(results);
                });
            });

            if(existing.length > 0) throw new Error("Username already exists");

            // Password hashing with 10 salt rounds
            const password_hash = await bcrypt.hash(password, 10);

            // insert new user
            const insertId = await new Promise((resolve, reject) => {
                const query = `
                    INSERT INTO users (first_name, last_name, age, salary, username, password, signup_date)
                    VALUES (?, ?, ?, ?, ?, ?, NOW());
                `;
                connection.query(query, [first_name, last_name, age, salary, username, password_hash], (err, result) => {
                    if(err) reject(err);
                    else resolve(result.insertId);
                });
            });

            return { id: insertId, username, first_name, last_name, age, salary };

        } catch(err) {
            throw err;
        }
    }

    async loginUser(username, password) {
        try {
            // Login query, succeeding upon correct username
            const loginResult = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM users WHERE username = ?";
                connection.query(query, [username], (err, results) => {
                    if (err) reject(err);
                    else resolve(results[0]);
                });
            });

            if (!loginResult) return { success: false, error: "Unknown username" };

            // Compare entered password to stored hash
            const passwordMatch = await bcrypt.compare(password, loginResult.password);
            if (!passwordMatch) return { success: false, error: "Unknown password" };

            // Set the last_login value to the current timestamp only after successfully logging in
            await new Promise((resolve, reject) => {
                const query = "UPDATE users SET last_login = CURRENT_TIMESTAMP() WHERE username = ?";
                connection.query(query, [username], (err, ) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            
            return { success: true, username };
        } catch(err) {
            throw err;
        }
    }

    async userIdSearch(userid){
        try{
             const response = await new Promise((resolve, reject) => 
                  {
                     const query = "SELECT * FROM users where username = ?;";
                     connection.query(query, [userid], (err, results) => {
                         if(err) reject(new Error(err.message));
                         else resolve(results);
                     });
                  }
             );
             return response;

         } catch(err) {
            throw err;
        }
    }

    async ageRangeSearch(min_age, max_age){
        try{
             const response = await new Promise((resolve, reject) => 
                  {
                     const query = "SELECT * FROM users WHERE age BETWEEN ? AND ?;";
                     connection.query(query, [min_age, max_age], (err, results) => {
                         if(err) reject(new Error(err.message));
                         else resolve(results);
                     });
                  }
             );
             return response;

         } catch(err) {
            throw err;
        }
    }

    async nullLoginSearch(){
        try{
             const response = await new Promise((resolve, reject) => 
                  {
                     const query = "SELECT * FROM users WHERE last_login IS NULL;";
                     connection.query(query, (err, results) => {
                         if(err) reject(new Error(err.message));
                         else resolve(results);
                     });
                  }
             );
             return response;

         } catch(err) {
            throw err;
        }
    }

    async registeredTodaySearch(){
        try{
             const response = await new Promise((resolve, reject) => 
                  {
                     const query = "SELECT * FROM users WHERE signup_date = CURRENT_DATE();";
                     connection.query(query, (err, results) => {
                         if(err) reject(new Error(err.message));
                         else resolve(results);
                     });
                  }
             );
             return response;

         } catch(err) {
            throw err;
        }
    }

    async searchByName(first_name, last_name) {
        try {
            const response = await new Promise((resolve, reject) => {
                let query = "SELECT * FROM users WHERE 1=1";
                const params = [];
                if (first_name) {
                    query += " AND first_name LIKE ?";
                    params.push(`%${first_name}%`);
                }
                if (last_name) {
                    query += " AND last_name LIKE ?";
                    params.push(`%${last_name}%`);
                }
                connection.query(query, params, (err, results) => {
                    if (err) reject(new Error(err.message));
                    else resolve(results);
                });
            });
            return response;
        } catch (err) {
            throw err;
        }
    }

    async searchBySalaryRange(minSalary, maxSalary) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM users WHERE salary BETWEEN ? AND ?;";
                connection.query(query, [minSalary, maxSalary], (err, results) => {
                    if (err) reject(new Error(err.message));
                    else resolve(results);
                });
            });
            return response;
        } catch (err) {
            throw err;
        }
    }

    async searchRegisteredAfterUser(userid) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = `
                    SELECT * FROM users 
                    WHERE signup_date > (
                        SELECT signup_date FROM users WHERE username = ?
                    );
                `;
                connection.query(query, [userid], (err, results) => {
                    if (err) reject(new Error(err.message));
                    else resolve(results);
                });
            });
            return response;
        } catch (err) {
            throw err;
        }
    }

    async searchRegisteredSameDayUser(userid) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = `
                    SELECT * FROM users 
                    WHERE DATE(signup_date) = (
                        SELECT DATE(signup_date) FROM users WHERE username = ?
                    )
                    AND username <> ?;
                `;
                connection.query(query, [userid, userid], (err, results) => {
                    if (err) reject(new Error(err.message));
                    else resolve(results);
                });
            });
            return response;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = DbService;