const db = require("./../config/database");
const bcrypt = require("bcrypt");
const logError = require("./../errors");


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
  getGames: (id) => {
    return new Promise( (resolve, reject) => {
      db.promiseQuery("SELECT gp.game_id as `game`, gp.player_id as `player` FROM `game_players` gp INNER JOIN `games` g ON g.game_id = gp.game_id WHERE gp.player_user_id = ? AND (g.game_status = '1' OR g.game_status = '0') AND gp.player_status = '1'",
          [id]).then((games, err) => {
            let games_user = {};
            if(err) {
              reject(err);
            } else {
              for( let x = 0; x < games.length; x++){
                try {
                  games_user[games[x]["game"]] = games[x]["player"];
                } catch(err) {
                    logError("Fetching games for user "+ id + err);
                }
              }
              resolve(games_user);
            }
      });
    });
  }
};

module.exports = User;
