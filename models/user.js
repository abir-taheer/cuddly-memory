const db = require("./../config/database");
const bcrypt = require("bcrypt");
const logError = require("./../errors");
const tools = require("./../config/tools");

const getByEmail = (email) => {
  return new Promise((resolve, reject) => {
    db.promiseQuery("SELECT * FROM `users` WHERE `user_email` = ? ", [email])
        .then((rows, err) => {
          if(err){
            reject(err);
          } else {
           resolve((rows.length ? rows[0] : false));
          }
        });
  });
};

const getById = (id) => {
  return new Promise((resolve, reject) => {
    db.promiseQuery("SELECT * FROM `users` WHERE `user_id` = ? ", [id])
        .then((rows, err) => {
          if(err){
            reject(err);
          } else {
            resolve((rows.length ? rows[0] : false));
          }
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
  getById: getById,
  newUser: (user_name, user_email, user_password) => {
    return new Promise((resolve, reject) => {
      try {
        (async () => {
          let email_check = await getByEmail(user_email);

          // There is no user with this email address, proceed creating the account
          if( ! email_check ){
            let password_hash = await hashPassword(user_password);
            let user_id_exists = true;
            let user_id = tools.genString(8);

            // Ensures that the user id that we've generated is unique.
            // Unlikely it'll need to run more than once, but just a precautionary measure
            for( let attempts = 0 ; user_id_exists && attempts < 5; attempts++ ){
              user_id_exists = await getById(user_id);
              if( user_id_exists ){
                user_id = tools.genString(8);
              }
            }

            if(user_id_exists) {
              reject("There was an error generating a unique user id. Please try again.");
            } else {
              await db.promiseQuery("INSERT INTO `users` (`user_id`, `user_name`, `user_email`, `user_password`) VALUES(?,?,?,?)",
                  [user_id, user_name, user_email, password_hash]);
              resolve(user_id);
            }

          } else {
            reject("There already exists a user with that email address");
          }

        })();
      } catch (er) {
        logError(er);
        reject("There was an unknown error");
      }
    });
  },
  getGames: (id) => {
    return new Promise( (resolve, reject) => {
      db.promiseQuery("SELECT gp.game_id as `game`, gp.player_id as `player` FROM `game_players` gp INNER JOIN `games` g ON g.game_id = gp.game_id WHERE gp.player_user_id = ? AND (g.game_status = '1' OR g.game_status = '0') AND gp.player_status >= -5",
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
