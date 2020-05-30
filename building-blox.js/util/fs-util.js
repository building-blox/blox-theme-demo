const fs = require("fs");
const path = require("path");
const config = require("../lib/config");

module.exports = {
  makeDir: function (path) {
    return new Promise(async function (resolve, reject) {
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
      }
      resolve();
    });
  },
  getDirectories: function (dir) {
    return new Promise((resolve) => {
      let directories = fs.readdirSync(dir).filter(function (file) {
        return fs.statSync(path.join(dir, file)).isDirectory();
      });
      resolve(directories);
    });
  },
  hasDataFile: function () {
    return new Promise(function (resolve, reject) {
      fs.readdir(config.paths.data, function (err, files) {
        if (err) {
          // No data folder
          resolve(false);
        } else {
          if (!files.length) {
            // No files in data folder, carry on
            resolve(false);
          } else {
            let hasData = false;
            for (let i = 0; i < files.length; i++) {
              const file = files[i];
              if (file === "db.json") {
                hasData = true;
                break;
              }
            }
            resolve(hasData);
          }
        }
      });
    });
  },
  contains: function (path, pattern) {
    return new Promise(function (resolve, reject) {
      try {
        let files = fs.readdirSync(`${path}`).filter(function (file) {
          return file.match(pattern);
        });
        resolve(files.length > 0);
      } catch (error) {
        resolve(false);
      }
    });
  },
};
