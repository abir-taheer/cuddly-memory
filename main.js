const db = require("./config/database");
// const emailer = require("./config/email");
const tools = require("./config/tools");

const bodyParser = require("body-parser");
const path = require("path");
const express = require("express");
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const expressSession = require("express-session");

const MySQLStore = require('express-mysql-session')(expressSession);
const sessionStore = new MySQLStore({
  clearExpired: true,
  checkExpirationInterval: 900000,
  expiration: (30 * 86400 * 1000),
  createDatabaseTable: true,
}, db.pool);

const session = expressSession({
  secret: "some_semi_permanent_not_so_secret_secret",
  name: "session",
  resave: true,
  saveUninitialized: true,
  store: sessionStore,
  cookie: {
    path: '/',
    httpOnly: true,
    secure: false,
    maxAge: (30 * 86400 * 1000)
  }
});

const User = require("./models/user");
const Game = require("./models/game");
const Card = require("./models/card");
const logError = require("./errors");

const app_port = process.env.PORT || 3001;

app.use(session);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'client/build')));

const shared_session = require("express-socket.io-session");

io.set('transports', ['websocket']);

io.use(shared_session(session, undefined, {autoSave: true}));

const active_games = {};

let restartInactivityTimer = game_id => {
  if( active_games[game_id].inactivity_timeout ){
    clearTimeout(active_games[game_id].inactivity_timeout);
  }
  active_games[game_id].inactivity_timeout = setTimeout(() => {
    Game.endGame(game_id);
    delete active_games[game_id];
  }, 1000 * 60 * 15);
};
let addActiveGame = (game_id) => {
  return new Promise((resolve) => {
    (async () => {
      let game_settings = await Game.alterSettings(game_id);

      active_games[game_id] = {
        game_settings: game_settings
      };

      restartInactivityTimer(game_id);
      resolve(active_games[game_id]);
    })();
  });
};

io.on('connection', socket => {
  let in_game = false;
  let game_info = {};
  let player_inactivity_timeout = setTimeout( () => {
    if(! in_game){
      socket.disconnect();
    }
  },60 * 1000);

  socket.on("disconnect", () => {
    (async () => {
      if(in_game){
        await db.promiseQuery("UPDATE `game_players` SET `player_status` = ? WHERE `game_id` = ? AND `player_id` = ?", [(game_info.player_status * -1), game_info.game_id, game_info.player_id]);
        io.to(game_info.game_id).emit("game_update", {game_players: await Game.getPlayers(game_info.game_id)});
      } else {
        clearTimeout(player_inactivity_timeout);
      }
    })();
  });

  //player status
  // -10 = banned
  // -5 idle admin
  // -3 = idle player
  // -1 = idle spectator
  // 1 = active spectator
  // 3 = active player
  // 5 = active admin

  socket.on("join", (game_id) => {
    (async () => {
      let player_id = socket.handshake.session.games[game_id];
      let player_info = await Game.getPlayerById(game_id, player_id);
      // Check if the game is in active games
      // If not, add it and add the appropriate timers and stuff

      let active_info = active_games[game_id];
      if(! active_info){
        active_info = await addActiveGame(game_id);
      }

      if(player_id && player_info && player_info.player_status >= -5 ){
        in_game = true;
        socket.join(game_id);
        socket.emit("join_status", true);
        // emit some information about the state of the game //

        // TODO UPDATE WHAT HAPPENS WHEN THE USER CONNECTS AND DISCONNECTS FROM THE SOCKET
        game_info = {
          game_id: game_id,
          player_id: player_id,
          player_status: player_info.player_status
        };

        socket.emit("settings_update", active_info);

        socket.emit("game_update", {
          // this will update the state in react for the game element
          game_players: await Game.getPlayers(game_id)
        });
      } else {
        socket.emit("join_status", false);
      }
    })();

  });

});

// Called when the user first opens the app
// Works -- 2019-08-27 13:23
app.route("/api/user/state").get((req, res) => {
  let info = {
    signed_in: req.session.signed_in
  };

  if(req.session.signed_in){
    User.getById(req.session.user_id)
        .then(user => {
          info.name = user.user_name;
          res.json(info);
        })
        .catch((err) => {
          res.json(info);
        });
  } else {
    res.json(info);
  }
});

// Works -- 2019-08-27 13:23
app.route("/api/auth/login").post((req, res) => {
  let success = {success: true};
  let fail = {success: false, error: "Those credentials are invalid. Please try again."};

  let user_email = req.body.email || "";
  let user_password = req.body.password || "";

  try {
    (async () => {
      let get_user = await User.getByEmail(user_email);
      if(get_user) {
        let password_valid = await User.testPassword(user_password, get_user.user_password);
        if(password_valid){
          let user_games = await User.getGames(get_user.user_id);
          req.session.signed_in = true;
          req.session.user_id = get_user.user_id;
          req.session.games = req.session.games || {};

          let unadded_games = Object.keys(req.session.games);

          let game_ids = Object.keys(user_games);
          for(let x = 0 ; x < game_ids.length ; x++ ){
            req.session.games[game_ids[x]] = user_games[game_ids[x]];
          }

          for(let x = 0; x < unadded_games.length; x++){
            await db.promiseQuery("UPDATE `game_players` SET `player_user_id` = ? WHERE `game_id` = ? AND `player_id` = ?", [get_user.user_id, unadded_games[x], req.session.games[unadded_games[x]]]);
          }

          await res.json(success);
        } else {
          await res.json(fail);
        }
      } else {
        await res.json(fail);
      }
    })();
  } catch(er){
    res.json(fail);
  }
});

app.route("/api/auth/signup").post((req, res) => {
  let response = {success: false};
  let user_name = req.body.name || "";
  let user_email = req.body.email || "";
  let user_password = req.body.password || "";

  if( ! (user_name && user_email && user_password) ) {
    response.error = "No fields can be left blank";
    return res.json(response);
  }
  if( ! tools.validateEmail(user_email) ){
    response.error = "The email address provided is not valid.";
    return res.json(response);
  }

  if( user_name.length > 64 ){
    response.error = "Name field cannot be longer than 64 characters";
    return res.json(response);
  }

  User.newUser(user_name, user_email, user_password)
      .then((user_id) => {
        req.session.signed_in = true;
        req.session.user_id = user_id;

        req.session.games = req.session.games || {};
        let unadded_games = Object.keys(req.session.games);

        for(let x = 0; x < unadded_games.length; x++){
          db.promiseQuery("UPDATE `game_players` SET `player_user_id` = ? WHERE `game_id` = ? AND `player_id` = ?", [user_id, unadded_games[x], req.session.games[unadded_games[x]]])
              .catch(() => logError("Error adding player_user_id of games after sign up."));
        }

        res.json({success: true});
      })
      .catch((err) => {
        response.error = err;
        res.json(response);
      });

});

// Works -- 2019-08-27 13:23
app.route("/api/auth/logout").get((req, res) => {
  req.session.destroy();
  res.json({signed_out: true});
});

app.route("/api/user/games").get((req, res) => {
  (async () => {
    req.session.games = req.session.games || {};

    let game_ids = Object.keys(req.session.games);

    for(let x = 0 ; x < game_ids.length ; x++){
      let game_info = await Game.getById(game_ids[x]);
      if(! game_info || game_info.game_status < 0){
        delete req.session.games[game_ids[x]];
      }
    }

    if(req.session.signed_in){
      try {
        let user_games = await User.getGames(req.session.user_id);
        Object.keys(user_games).forEach((key) => {
          req.session.games[key] = user_games[key];
        });
      } catch(e) {
        logError(e);
      }
    }

    let current_games = [];

    for(let game_id in req.session.games) {
      try {
        if(req.session.games.hasOwnProperty(game_id)){
          let game_data = await Game.getById(game_id);
          if(game_data) {
            current_games.push(game_data);
          }
        }
      } catch(e) {
        logError(e);
      }
    }
    await res.json(current_games);
  })();
});

app.route("/api/card/packs/official").get((req, res) => {
  Card.getOfficialPacks()
      .then((result) => {
        res.json({success: true, data: result});
      })
      .catch(err => {
        res.json({success: false, error: "There was an unknown error getting the cards"});
      });
});

app.route("/api/game/create").post((req, res) => {
  let response = {success: false};
  req.session.games = req.session.games || {};

  if(Object.keys(req.session.games).length >= 5){
    response.error = "You cannot be in more than 5 games at a time.";
    return res.json(response);
  }

  if(! String(req.body.player_name) || ! String(req.body.game_name)){
    response.error = "No fields can be left blank";
    return res.json(response);
  }

  if( String(req.body.game_name).length > 64 ){
    response.error = "Game name cannot be longer than 64 characters";
    return res.json(response);
  }

  if( String(req.body.player_name).length > 24 ){
    response.error = "Player name cannot be longer than 24 characters";
    return res.json(response);
  }

  try {
    (async () => {
      let selected_card_packs = Array.isArray(req.body.selected_card_packs) ? req.body.selected_card_packs : [];
      let num_cards = {white: 0, black: 0};
      let valid_card_packs = [];
      for(let x = 0 ; x < selected_card_packs.length ; x++){
        try {
          let get_count = await Card.getNumInPack(selected_card_packs[x]);
          num_cards.white += get_count.white;
          num_cards.black += get_count.black;
          if( get_count.white || get_count.black ){
            valid_card_packs.push(selected_card_packs[x]);
          }
        } catch (er){
          logError(er);
        }
      }

      if(num_cards.white < 50 && num_cards.black < 25){
        response.error = "There aren't enough of each type of card to start a game in the selected card packs.";
        return res.json(response);
      }

      let game_id = await Game.create(String(req.body.game_name));
      let player_id = await Game.addPlayer(game_id, String(req.body.player_name), 5, req.session.user_id);
      req.session.games[game_id] = player_id;
      for(let x = 0 ; x < valid_card_packs.length ; x++){
        await Game.addCardPack(game_id, valid_card_packs[x]);
      }

      let game_settings = await Game.alterSettings(game_id, req.body);
      let join_code = await Game.addJoinCode(game_id);

      response.success = true;
      response.data = {
        game_id: game_id,
        player_id: player_id,
        join_code: join_code,
      };

      await res.json(response);
    })();
  } catch (er) {
    logError(er);
    response.error = "There was an unknown error. Please try again";
    res.json(response);
  }
});

app.route("*").get((req,res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

http.listen(app_port, () => {
  console.log('listening on *:' + app_port);
});
