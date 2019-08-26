const db = require("./config/database");
// const emailer = require("./config/email");

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
const logError = require("./errors");

const genString = len => {
  const chars = "abcdefghijklmnopqrstuvwxyz1234567890";
  let str = "";
  for(let x = 0; x < len; x++ ){
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
};

const app_port = process.env.PORT || 3001;

app.use(session);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'client/build')));

const shared_session = require("express-socket.io-session");

io.set('transports', ['websocket']);

io.use(shared_session(session, undefined, {autoSave: true}));



io.on('connection', socket => {
  console.log("someone joined a game");

  socket.on("disconnect", () => {
    console.log("A gamer disconnected.");
  });

  socket.on("join", (game_id) => {
    console.log(socket.handshake.session.user_name + " attempted to join game " + game_id);
    
  });

});

// Called when the user first opens the app
app.route("/api/state").get((req, res) => {
  res.json({
    "signed_in": (req.session.signed_in || false),
    "name": (req.session.user_name || "Guest")
  });
});


app.route("/api/auth/login").post((req, res) => {
  let success = {success: true};
  let fail = {success: false, error: "Those credentials are invalid. Please try again."};

  let user_email = req.body.email || "";
  let user_password = req.body.password || "";
  User.getByEmail(user_email)
      .then(rows => {
        if( rows.length === 0 ){
          res.json(fail);
        } else {
          User.testPassword(user_password, rows[0]["user_password"])
              .then((isValid) => {
                if(isValid){
                  req.session.signed_in = true;
                  req.session.user_name = rows[0]["user_name"];
                  req.session.user_id = rows[0]["user_id"];
                  res.json(success);
                } else {
                  res.json(fail);
                }
              });
        }
      })
      .catch((e) => {
        logError(e);
        res.json(fail);
      });
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
  if( ! User.validateEmail(user_email) ){
    response.error = "The email address provided is not valid.";
    return res.json(response);
  }

  if( user_name.length > 64 ){
    response.error = "Name field cannot be longer than 64 characters";
    return res.json(response);
  }

  User.getByEmail(user_email)
      .then(() => {
        let user_id = genString(8);
        User.newUser(user_id, user_name, user_email, user_password)
            .then(()=>{
              req.session.signed_in = true;
              req.session.user_name = user_name;
              req.session.user_id = user_id;
              res.json({success: true});
            });
      })
      .catch((err) => {
        response.error = "There was an unknown error. Please contact the developer if this continues";
        logError(err);
        res.json(response);
      });

});

app.route("/api/auth/logout").get((req, res) => {
  req.session.destroy();
  res.json({signed_out: true});
});

app.route("/api/user/games").get((req, res) => {
  (async () => {
    req.session.games = req.session.games || {};

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
          let game_data = await Game.byId(game_id);
          current_games.push(game_data[0]);
        }
      } catch(e) {
        logError(e);
      }
    }
    await res.json(current_games);
  })();
});

app.route("/api/game/create").post((req, res) => {
  console.log(req.body);
  res.json({success: true});
});

app.route("*").get((req,res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

http.listen(app_port, () => {
  console.log('listening on *:' + app_port);
});
