const pool = require("../config/database");

const User = {};

User.getUserByEmail = email => {
  return pool.getConnection((err, con) => {
    con.query("SELECT * FROM `users` WHERE `user_email` = ?", [email], (err, res) => {
      return res;
    });
  });
};

