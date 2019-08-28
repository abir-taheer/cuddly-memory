const db = require("./../config/database");
const tools = require("./../config/tools");

const Game = {
  getById: (id) => {
    return new Promise((resolve, reject) => {
      db.promiseQuery("SELECT * FROM `games` WHERE `game_id` = ?", [id])
          .then(rows => resolve(rows.length ? rows[0] : false))
          .catch(reason => reject(reason));
    });
  },
  create: (name) => {
    // Create a new, paused, game and resolve its id
    return new Promise((resolve, reject) => {
      db.promiseQuery("INSERT INTO `games` (game_name) VALUES(?)", [name])
          .then(result=> resolve(result.insertId))
          .catch(err => reject(err));
    });
  },
  /**
   * Adds/Updates game settings
   *
   * @param {string} id - ID of the game to be affected
   * @param {object} settings - An object containing the settings to add/update
   *
   * @return {Promise}
   */
  alterSettings: (id, settings = {}) => {
    return new Promise((resolve, reject) => {
      let game_types = {
        Standard: 0,
        Democracy: 1,
        "Card Elimination": 2
      };

      try {
        (async () => {
          let settings_exist = await
              db.promiseQuery("SELECT COUNT(*) as `settings_exist` FROM `game_settings` WHERE `game_id` = ?", [id])
                  .then(rows => Boolean(rows[0].settings_exist));

          // Create a settings entry with the default values and then update them appropriately
          if(! settings_exist){
            await db.promiseQuery("INSERT INTO `game_settings` (`game_id`) VALUES (?)", [id]);
          }

          let settings_query = await db.promiseQuery("SELECT * FROM `game_settings` WHERE `game_id` = ?", [id]);
          let current_settings = settings_query[0];
          let undefined_fallback = (val, def) => {
            if(typeof val !== 'undefined'){
              return val;
            }
            return def;
          };

          let new_settings = {
            game_type: (settings.game_type && game_types[settings.game_type]) ? game_types[settings.game_type] : current_settings.game_type,
            turn_timer: (settings.turn_timer && parseInt(settings.turn_timer) >= 15 && parseInt(settings.turn_timer) <= 180 ) ? parseInt(settings.turn_timer) : current_settings.turn_timer,
            make_haiku: Boolean(undefined_fallback(settings.make_haiku, current_settings.make_haiku)),
            trade_points_redraw: Boolean(undefined_fallback(settings.trade_points_redraw, current_settings.trade_points_redraw)),
            rando_cardrissian: Boolean(undefined_fallback(settings.rando_cardrissian, current_settings.rando_cardrissian)),
            chat: Boolean(undefined_fallback(settings.chat, current_settings.chat))
          };
          let update_settings = await db.promiseQuery("UPDATE game_settings SET `game_type` = ?, `turn_timer` = ?, `make_haiku` = ?, `trade_points_redraw` = ?, `rando_cardrissian` = ?, `chat` = ? WHERE `game_id` = ?",
              [new_settings.game_type, new_settings.turn_timer, new_settings.make_haiku, new_settings.trade_points_redraw, new_settings.rando_cardrissian, new_settings.chat, id]);
          resolve(new_settings);
        })();
      } catch(er) {
        reject(er);
      }
    });
  },
  getPlayerById: (game_id, player_id) => {
    return new Promise((resolve, reject) => {
      db.promiseQuery("SELECT * FROM `game_players` WHERE `game_id` = ? AND `player_id` = ?", [game_id, player_id])
          .then(rows => resolve((rows.length ? rows[0] : false)))
          .catch(err => reject(err));
    });
  },
  getPlayerByUserId: (game_id, user_id) => {
    return new Promise((resolve, reject) => {
      db.promiseQuery("SELECT * FROM `game_players` WHERE `game_id` = ? AND `player_user_id` = ?", [game_id, user_id])
          .then((rows, err) => {
            if(err){
              reject(err);
            } else{
              resolve((rows.length ? rows[0] : false));
            }
          });
    });
  },
  addPlayer: (game_id, player_name, player_status = 1, user_id = null) => {
    return new Promise((resolve, reject) => {
      try {
        (async () => {
          // There's a unique index for a user_id and a game_id, duplicates must not be allowed
          if(user_id){
            let user_id_check = await Game.getPlayerByUserId(game_id, user_id);
            if(user_id_check){
              resolve(user_id_check.player_id);
              return;
            }
          }

          let player_id = tools.genString(3);
          let player_id_exists = true;

          for(let attempts = 0; player_id_exists && attempts < 5; attempts++){
            player_id_exists = Game.getPlayerById(game_id, player_id);
            if(player_id_exists){
              player_id = tools.genString(3);
            }
          }

          await db.promiseQuery("INSERT INTO `game_players` (`game_id`, `player_id`, `player_user_id`, `player_name`, `player_status`) VALUES (?,?,?,?,?)", [game_id, player_id, user_id, player_name, player_status]);
          resolve(player_id);
        })();
      } catch(er) {
        reject(er);
      }
    });
  },
  addCardPack: (game_id, card_pack) => {
    return new Promise((resolve, reject) => {
      db.promiseQuery("INSERT INTO `game_card_packs` (`game_id`, `card_pack_id`) VALUES(?,?)", [game_id, card_pack])
          .then(() => resolve(card_pack))
          .catch(err => reject(err));
    });
  }
};

module.exports = Game;