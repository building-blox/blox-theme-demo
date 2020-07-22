const config = require("./config");
const gutil = require("gulp-util");
const sass = require("gulp-sass"),
concat = require('gulp-concat'),
  postcss = require("gulp-postcss"),
  scss = require("postcss-scss"),
  autoprefixer = require("autoprefixer"),
  postcssProcessors = [
    autoprefixer(),
  ];
const fs = require("fs");
const fsUtils = require("../util/fs-util");
const path = require("path");

const rename = require("gulp-rename");

module.exports = {
  /**
   * Process page styles.
   */
  doPage: async function (args) {
    args.gulp
      .src(args.source, { allowEmpty: true })
      .pipe(postcss(postcssProcessors, { syntax: scss }))
      .pipe(sass({ outputStyle: "compressed" }).on("error", gutil.log))
      .pipe(rename(`styles.min.css`))
      .pipe(args.gulp.dest(args.dest));
  },
  doComponents: async function (args) {
    let format = "/**/*.scss";
    console.log('do components--', [path.join(config.paths.components, format)])
    console.log('do components--', config.paths.componentStyles)

    args.gulp
      .src([path.join(config.paths.components, format)], { allowEmpty: true })
      // .pipe(postcss(postcssProcessors, { syntax: scss }))
      // .pipe(sass({ outputStyle: "compressed" }).on("error", gutil.log))
      .pipe(concat('_components.scss'))
      .pipe(args.gulp.dest(config.paths.componentStyles));
    // return new Promise(async (resolve) => {
      // let componentStyles = "";
      // let dirs = await fsUtils.getDirectories(config.paths.components);
      // for (let i = 0; i < dirs.length; i++) {
      //   const dir = dirs[i];
      //   console.log("component!", dir);
      //   componentStyles += await module.exports.getStyle(`${config.paths.components}/${dir}/${dir}.scss`);
      // }
      // console.log("2 styles-->", componentStyles);
      // fsPath.writeFile(
      //   `${projectRoot}/src/data/db.json`,
      //   JSON.stringify(response.data, null, 4),
      //   function (err) {
      //     if (err) {
      //       throw err;
      //     } else {
      //       console.log(
      //         success("Jen: Remote data successfully written to file.")
      //       );
      //       resolve();
      //     }
      //   });
      // resolve();
    // })
  },
  // getStyle: function(path){
  //   return new Promise((resolve) => {
  //     fs.readFile(path, function read(
  //       err,
  //       data
  //     ) {
  //       if (err) {
  //         console.log("err..", err);
  //         throw err;
  //       }
  //       // componentStyles += data;
  //        console.log("1 styles->", data);
  //       resolve(data)
  //     });
  //   })
  // }
};
