const mysql = require("mysql");

const credentials = {
  host: "localhost",
  user: "myuser",
  password: "!Mypassword1",
  database: "cuddly_memory"
};

const con = mysql.createConnection(credentials);

module.exports = con;