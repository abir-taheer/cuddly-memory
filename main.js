const db = require("./config/database");
const emailer = require("./config/email");

const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const app = require("express")();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const session = require('express-session')({
  secret: (Math.random().toString() + Math.random().toString()),
  name: "session",
  resave: true,
  saveUninitialized: true,
  cookie: {
    path: '/',
    httpOnly: true,
    secure: false,
    maxAge: (30 * 86400 * 1000)
  }
});

const User = require("./models/user");

const genString = len => {
  const chars = "abcdefghijklmnopqrstuvwxyz1234567890";
  let str = "";
  for(let x = 0; x < len; x++ ){
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
};

const app_port = 3001;

app.use(session);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const shared_session = require("express-socket.io-session");

io.set('transports', ['websocket']);

io.use(shared_session(session, {
  autoSave: true
}));



io.on('connection', socket => {
  console.log("someone connected");
  socket.handshake.session.username = "Test Name";
  socket.handshake.session.save();

  socket.on("disconnect", () => {
    console.log("A user disconnected.");
  });

});

// Called when the user first opens the app
app.route("/api/state").get((req, res) => {
  res.send(JSON.stringify({
    "signed_in": (req.session.signed_in || false),
    "name": (req.session.user_name || "Guest")
  }));
});


app.route("/api/auth/login").post((req, res) => {
  let success = JSON.stringify({success: true});
  let fail = JSON.stringify({success: false, error: "Those credentials are invalid. Please try again."});

  User.getByEmail(req.body.email)
      .then(rows => {
        if( rows.length === 0 ){
          res.send(fail);
        } else {
          User.testPassword(req.body.password, rows[0].user_password)
              .then((isValid) => {
                if(isValid){
                  req.session.signed_in = true;
                  req.session.user_name = rows[0].user_name;
                  req.session.user_id = rows[0].user_id;
                  res.send(success);
                } else {
                  res.send(fail);
                }
              });
        }
      })
      .catch(() => {
        res.send(fail);
      });
});

app.route("/api/auth/signup").post((req, res) => {
  let response = {success: false};

  if( req.body.password === "" || req.body.name === "" || req.body.email === "" ) {
    response.error = "No fields can be left blank";
    return res.send(JSON.stringify(response));
  }
  if( ! User.validateEmail(req.body.email) ){
    response.error = "The email address provided is not valid.";
    return res.send(JSON.stringify(response));
  }

  if( req.body.name.length > 25 ){
    response.error = "Name field cannot be longer than 25 characters";
    return res.send(JSON.stringify(response));
  }

  User.getByEmail(req.body.email).then(rows => {
    let user_id = genString(8);
    User.newUser(user_id, req.body.name, req.body.email, req.body.password)
        .then(()=>{
          req.session.signed_in = true;
          req.session.user_name = req.body.name;
          req.session.user_id = user_id;
          res.send(JSON.stringify({success: true}));
        })
        .catch((err) => {
          response.error = err;
        });
  });

});

app.route("/api/auth/logout").get((req, res) => {
  req.session.destroy();
  res.send(JSON.stringify({signed_out: true}));
});

app.route("/api/user/games").get((req, res) => {
  if( req.session.signed_in ){
    // Query the database for any games that the user may be a part of
  }
});

http.listen(app_port, () => {
  console.log('listening on *:' + app_port);
});
