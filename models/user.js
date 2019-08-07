const db = require("./../config/database");
const bcrypt = require("bcrypt");

const User = {
  getByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.promiseQuery("SELECT * FROM `users` WHERE `user_email` = ? ", [email])
          .then((rows, err) => {
            (err) ? reject(err) : resolve(rows);
          });
    });
  },
  testPassword: (password, hash) => {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, hash, (err, valid) => {
        (err) ? reject(err) : resolve(valid);
      });
    });
  }
};

module.exports = User;
