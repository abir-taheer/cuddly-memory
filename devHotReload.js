const fs = require('fs');
const cp = require('child_process');


console.log(`Watching for file changes on main`);

var main = cp.fork("./main.js");

fs.watchFile("./main.js", { interval: 1000 }, (curr, prev) => {
  main.kill();
  console.log("------process killed------");
  main = cp.fork("./main.js");
});