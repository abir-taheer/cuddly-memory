const app = require('express')();
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
app.get("/api/state", (req, res) => {
  res.send(JSON.stringify({
    "signed_in": (req.session.signed_in || false),
    "name": (req.session.name || "Guest")
  }));
});

app.post("/api/auth/login", (req, res) => {
  req.session.signed_in = true;
  res.send(JSON.stringify({
    "success": true
  }));
});

http.listen(app_port, () => {
  console.log('listening on *:' + app_port);

});
