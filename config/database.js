const mysql = require("mysql");

const con = mysql.createPool({
  connectionLimit: 15,
  host: "localhost",
  user: "myuser",
  password: "!Mypassword1",
  database: "cuddly_memory"
});

con.connect(function(err) {
  if (err) throw err;
});

module.exports = con;