const pool = require("./config/database.js");

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
  let fail = JSON.stringify({success: false, error: "There is no user with those credentials"});
  pool.getConnection((err, con) => {
    con.query("SELECT * FROM `users` WHERE `user_email` = ?", req.body.username, (err, row) => {
      if( row.length === 0 ){
        res.send(fail);
      } else {
        bcrypt.compare(req.body.password, row[0].user_password, function(err, valid) {
          if(valid){
            req.session.signed_in = true;
            req.session.user_name = row[0].user_name;
            req.session.user_id = row[0].user_id;
            res.send(success);
          } else {
            res.send(fail);
          }
        });
      }

    });

    con.release();
  });
});

app.route("/api/auth/logout").get((req, res) => {
  req.session.destroy();
  res.send(JSON.stringify({signed_out: true}));
});

http.listen(app_port, () => {
  console.log('listening on *:' + app_port);
});
