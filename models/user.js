const db = require("./../config/database");

const User = {
  getByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.promiseQuery("SELECT * FROM `users` WHERE `user_email` = ? ", [email])
          .then((rows, err) => {
            (err) ? reject(err) : resolve(rows);
          });
    });
  }
};

User.getByEmail("abir488@gmail.com").then((email) => {console.log(email)});