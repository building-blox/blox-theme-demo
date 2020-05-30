/** !
 * @fileOverview A Javascript library for easily creating static websites. BuildingBlox
 * manages project template files for generation of an optimised public directory. Apart from the
 * use of Nunjucks, BuildingBlox is unopinionated, leaving felxibility for the developer to specify
 * dependencies.
 * @version 0.1.0
 * @license
 * Copyright (c) 2019 Richard Lovell
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the 'Software'), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
(function () {
  "use strict";

  const chalk = require("chalk");
  const argv = require("yargs").argv;
  const path = require("path");
  const fs = require("fs");
  const fsPath = require("fs-path");
  const axios = require("axios");
  const info = chalk.keyword("lightblue");
  const success = chalk.keyword("lightgreen");
  const fsUtils = require("./util/fs-util");
  const config = require("./lib/config");
  const constants = require("./lib/constants");
  const templates = require("./lib/templates");
  const scripts = require("./lib/scripts");
  const styles = require("./lib/styles");

  /**
   * Blox class. Prepares building blocks for static site generation including pages,
   * partials and components. Connects styles, scripts and images for each block.
   */
  class Blox {
    constructor(gulp, options = {}) {
      this.gulp = gulp;
      this.options = options;
      this.hooks = {};
      this.globalData;
      this.assignTasks();
      this.nunjucksOptions = {
        path: [config.paths.project, "build/css/"],
      };
    }

    addAction(name, action) {
      if (!this.hooks[name]) this.hooks[name] = [];
      this.hooks[name].push(action);
    }

    /**
     * Set up Gulp tasks.
     */
    async assignTasks() {
      let self = this;
      this.gulp.task("blox:build", (done) =>
        self.gulp.series("blox:load", "blox:run")(done)
      );

      this.gulp.task("blox:dev", (done) => self.gulp.series("blox:run")(done));

      this.gulp.task("blox:load", function (done) {
        if (!fsUtils.hasDataFile()) {
          if (!self.options.dataUrl && !argv.dataUrl) {
            throw new Error("Blox: No data URL provided");
          }
          console.log(
            info("blox: fetching remote data from " + self.options.dataUrl)
          );
          return new Promise(function (resolve, reject) {
            let dataUrl =
              self.options.dataUrl !== undefined
                ? self.options.dataUrl
                : argv.dataUrl;
            axios
              .get(dataUrl)
              .then(function (response) {
                fsPath.writeFile(
                  `${config.paths.data}/db.json`,
                  JSON.stringify(response.data, null, 4),
                  function (err) {
                    if (err) {
                      throw err;
                    } else {
                      console.log(
                        success(
                          "Blox: Remote data successfully written to file."
                        )
                      );
                      resolve();
                    }
                  }
                );
              })
              .catch(function (error) {
                reject(error);
              });
          }).then(function () {
            done();
          });
        } else {
          console.log(info("Blox: Data not loaded - no db.json file found"));
          done();
        }
      });

      this.gulp.task("blox:run", function (done) {
        self.run().then(function () {
          done();
        });
      });
    }

    /**
     * Get the data ready for templating.
     * Data is retrieved from all files kept in the data directory.
     */
    async init() {
      return new Promise(async (resolve, reject) => {
        this.dirs = await fsUtils.getDirectories(config.paths.pages);
        fs.readdir(config.paths.data, (err, files) => {
          if (err) reject(err);
          let dataArray = [];
          files.forEach((file) => {
            let content = require(`${config.paths.data}/${file}`);
            if (file === "db.json") {
              content = { db: content };
            }
            dataArray.push(content);
          });
          this.globalData = {
            blox: dataArray.reduce(function (result, current) {
              return Object.assign(result, current);
            }, {}),
          };
          this.globalData.blox.page = {
            headElements: [],
          };
          resolve();
        });
      });
    }

    /**
     * Run Blox.
     */
    async run() {
      await Promise.all([
        await this.init(),
        await this.doTheme(),
        await scripts.doComponentScripts(),
        await this.doGlobalScripts(),
        await this.doTemplates(),
      ]);
    }

    async doGlobalScripts() {
      await scripts.doScripts({
        gulp: this.gulp,
        source: `${path.join(__dirname, "../")}src/assets/js/index.js`,
        dest: `${path.join(__dirname, "../")}public/js`
      });
    }


    /**
     * Setup and page templates.
     */
    async doTemplates() {
      await Promise.all([
        await this.doMasterTemplates(),
        await this.doDetailTemplates(),
      ]);
    }

    /**
     * Setup and render master page templates.
     */
    async doMasterTemplates() {
      await templates.doPages({
        gulp: this.gulp,
        options: this.options,
        dirs: this.dirs,
        globalData: this.globalData,
      });
    }

    /**
     * Setup and render detail page templates.
     */
    async doDetailTemplates() {
      for (let i = 0; i < this.dirs.length; i++) {
        const dir = this.dirs[i];
        let subdirs = await fsUtils.getDirectories(
          config.paths.pages + "/" + dir
        );
        // find a subfolder with the name "detail"
        for (let i = 0; i < subdirs.length; i++) {
          let subdir = subdirs[i];
          if (subdir === "detail") {
            if (this.globalData.blox.db[dir].items) {
              await templates.doDetailPages({
                gulp: this.gulp,
                options: this.options,
                globalData: this.globalData,
                dir: dir,
                subdir: subdir,
              });
            }
          }
        }
      }
    }

    /**
     * Load data from external resource. Data will be written to src/data/db.json.
     */
    loadData() {
      return new Promise((resolve, reject) => {
        if (
          !this.options.dataFetchType &&
          this.options.dataFetchType === "remote"
        ) {
          if (!this.options.apiEndpoint) {
            throw new Error(
              'Please provide "apiEndpoint" or set "dataFetchType" to "local"'
            );
          }
          if (!this.options.apiKey) {
            throw new Error(
              'Please provide "apiKey" or set "dataFetchType" to "local"'
            );
          }
        } else {
          if (this.options.dataFetchType !== "local") {
            throw new Error(
              'Value of dataFetchType must be either "remote" or "local"'
            );
          } else {
            return;
          }
        }
        let dataUrl = `${this.options.apiEndpoint}?apikey=${this.options.apiKey}`;
        axios
          .get(dataUrl)
          .then(async (response) => {
            await this.doTheme(response.data.meta.space);
            await write.sync(`${this.dataPath}db.json`, response.data);
            console.log(
              success(
                "Blox: Remote data successfully written to src/data/db.json"
              )
            );
            resolve();
          })
          .catch(function (err) {
            console.log(
              info(
                "Blox: Unable to retreive data. Falling back to local data.",
                err
              )
            );
            resolve();
          });
      });
    }

    doTheme(space) {
      return new Promise(async (resolve) => {
        const hookName = constants.hooks.doTheme;
        if (this.hooks[hookName])
          this.hooks[hookName].forEach((action) => action(this.globalData));
        resolve();
      });
    }
  }

  module.exports = Blox;
})();
