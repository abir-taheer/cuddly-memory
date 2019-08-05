const mysql = require("mysql");

const pool = mysql.createPool({
  connectionLimit: 50,
  host: "localhost",
  user: "myuser",
  password: "!Mypassword1",
  database: "cuddly_memory"
});

pool.getConnection(function(err, connection) {
  if (err) throw err;
  connection.release();
});

module.exports = pool;