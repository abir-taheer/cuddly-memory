const db = require("./../config/database");

const Game = {
  byId: (id) => {
    return new Promise((resolve, reject) => {
      db.promiseQuery("SELECT * FROM `games` WHERE `game_id` = ?", [id]).then((rows, err) => {
        err ? reject("There was an error communicating with the database") : resolve(rows);
      });
    });
  }
};