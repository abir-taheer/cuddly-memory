const db = require("./../config/database");
const bcrypt = require("bcrypt");

const getByEmail = (email) => {
  return new Promise((resolve, reject) => {
    db.promiseQuery("SELECT * FROM `users` WHERE `user_email` = ? ", [email])
        .then((rows, err) => {
          (err) ? reject(err) : resolve(rows);
        });
  });
};

const hashPassword = (password) => {
  return new Promise((resolve, reject)=> {
    bcrypt.hash(password, 12, function(err, hash) {
      if(err) reject(err);
      resolve(hash);
    });
  });
};

const User = {
  getByEmail: getByEmail,
  testPassword: (password, hash) => {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, hash, (err, valid) => {
        (err) ? reject(err) : resolve(valid);
      });
    });
  },
  newUser: (user_id, user_name, user_email, user_password) => {
    return new Promise((resolve, reject) => {
      getByEmail(user_email).then(rows => {
        if(rows.length === 0){
          hashPassword(user_password).then((hash) =>{
            db.promiseQuery("INSERT INTO `users` (`user_id`, `user_name`, `user_email`, `user_password`) VALUES(?,?,?,?)",
                [user_id, user_name, user_email, hash])
                .then(() => {
                  resolve(true);
                })
                .catch((err) => {
                  reject("There was an error communicating with the database");
                });
          });
        } else {
          reject("There already exists a user with that email address");
        }
      });
    });
  },
  validateEmail: (email) => {
    const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegexp.test(email);
  },
  getGames: () => {

  }
};

module.exports = User;
