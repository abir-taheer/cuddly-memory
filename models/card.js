const db = require("./../config/database");
const tools = require("./../config/tools");

const Card = {
  getNumInPack: (card_pack_id) => {
    return new Promise((resolve, reject) => {
      db.promiseQuery("SELECT count(IF(c.`card_type` = 1, 1, null)) as `white`, COUNT(IF(c.`card_type` = 0, 1, null)) as `black` FROM cards c INNER JOIN cards_in_pack cp ON cp.`card_id` = c.`card_id` WHERE cp.`card_pack_id` = ?", [card_pack_id])
          .then(res => resolve(res[0]))
          .catch(err => reject(err));
    });
  },
  getOfficialPacks: () => {
    return new Promise((resolve, reject) => db.promiseQuery("SELECT \n" +
          "COUNT(IF(c.`card_type` = 1, 1, null)) as `white`, \n" +
          "COUNT(IF(c.`card_type` = 0, 1, null)) as `black`,\n" +
          "cp.`*`, \n" +
          "u.`user_name` AS `creator_name`\n" +
          "FROM `cards` c \n" +
          "INNER JOIN `cards_in_pack` cip ON cip.`card_id` = c.`card_id`\n" +
          "INNER JOIN `card_packs` cp ON cip.`card_pack_id` = cp.`card_pack_id`\n" +
          "INNER JOIN `users` u ON u.`user_id` = cp.`card_pack_creator`\n" +
          "WHERE cp.`official` = 1\n" +
          "GROUP BY cp.`card_pack_id`")
          .then(res => resolve(res))
          .catch(err => reject(err))
    );
  }
};

module.exports = Card;