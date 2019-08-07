const mysql = require("mysql");

const pool = mysql.createPool({
  connectionLimit: 50,
  host: "localhost",
  user: "root",
  password: "password",
  database: "cuddly_memory"
});

pool.getConnection(function(err, connection) {
  if (err) throw err;
  connection.release();
});

const promiseQuery = (query, params = []) => {
  let conn;
  return new Promise((resolve, reject) => {
    pool.getConnection((err, c) => {
      conn = c;
      if(err){
        reject(err);
        conn.release();
      } else {
        conn.query(query, params, (err, rows) => {
          if(err){
            reject(err);
          } else {
            resolve(rows);
          }
          conn.release();
        });
      }

    })
  });
};

module.exports = {
  pool: pool,
  promiseQuery: promiseQuery
};