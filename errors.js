const fs = require("fs");

logError = (error, callback = () => {}) => {
  fs.appendFile("./errors.txt", new Date().toUTCString() + " - " + error + "\n", callback);
};

module.exports = logError;