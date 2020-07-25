const fsPath = require("fs-path");
const axios = require("axios");

const DB_DATA_FILE_PATH = `./src/data/db.json`;

/**
 * Load data from external resource. Data will be written to src/data/db.json.
 */
module.exports = async (config) => {
  return new Promise(function (resolve, reject) {
    console.log('dataUrl:', config.options.dataUrl)
    axios
      .get(config.options.dataUrl)
      .then(function (response) {
        fsPath.writeFile(
          DB_DATA_FILE_PATH,
          JSON.stringify(response.data, null, 4),
          function (err) {
            if (err) {
              throw err;
            } else {
              console.log("Remote data successfully written to file.");
              resolve();
            }
          }
        );
      })
      .catch(function (error) {
        reject(error);
      });
  });
};
