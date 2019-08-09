const fs = require("fs");
const app_config = require("./config/app");
const path = require("path");

logError = (error, callback = () => {}) => {
  fs.appendFile(app_config.root_path + "/errors.txt", new Date().toUTCString() + " - " + error + "\n", callback);
};

module.exports = logError;