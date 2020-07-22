const dotenv = require("dotenv").config();
const dotenvExpand = require("dotenv-expand");
dotenvExpand(dotenv);

require("events").EventEmitter.prototype._maxListeners = 100;

const gulp = require("gulp"),
  gutil = require("gulp-util"),
  rename = require("gulp-rename"),
  clean = require("gulp-clean");

const sass = require("gulp-sass"),
  postcss = require("gulp-postcss"),
  scss = require("postcss-scss"),
  autoprefixer = require("autoprefixer"),
  postcssProcessors = [autoprefixer()];

const Blox = require("./building-blox.js");

const blox = new Blox(gulp, {
  homePage: "home",
  dataUrl: process.env.DATA_URL,
});

//add actions
blox.addAction("do_theme", require("./actions/theme").doTheme);
blox.addAction("load_data", require("./actions/loadData"));

const browserSync = require("browser-sync").create();

/**********
IMAGES
***********/

gulp.task("images", function () {
  return gulp
    .src(["src/assets/images/**/*.{gif,jpg,png,svg}"])
    .pipe(gulp.dest("public/images"));
});

gulp.task("webmanifest", function () {
  return gulp.src(["src/site.webmanifest"]).pipe(gulp.dest("public"));
});

/**********
SASS
***********/

gulp.task("sass", function () {
  return (
    gulp
      .src(["src/assets/scss/index.scss"])
      .pipe(postcss(postcssProcessors, { syntax: scss }))
      .pipe(sass({ outputStyle: "compressed" }).on("error", gutil.log))
      // .pipe(
      //   cssnano({
      //     autoprefixer: {
      //       browsers: ["> 1%", "last 2 versions", "Firefox >= 20"],
      //       add: true,
      //     },
      //   })
      // )
      .pipe(rename("styles.min.css"))
      .pipe(gulp.dest("public/css/"))
  );
});

/**********
WATCH
***********/

//watch templates

gulp.task("watch-templates", function (done) {
  gulp
    .watch("src/templates/**/**/*.njk", gulp.series("blox:build"))
    .on("change", stackReload);
  var timer = null;
  function stackReload(file) {
    if (timer) clearTimeout(timer);
    if (!gulp.isRunning) {
      timer = setTimeout(function () {
        browserSync.reload();
      }, 250);
    }
  }
  done();
});

//watch scripts

gulp.task("watch-scripts", function (done) {
  gulp
    .watch(
      ["src/assets/js/**/*.js", "src/templates/**/*.js"],
      gulp.series("blox:build")
    )
    .on("change", stackReload);
  var timer = null;
  function stackReload(file) {
    if (timer) clearTimeout(timer);
    if (!gulp.isRunning) {
      timer = setTimeout(function () {
        browserSync.reload();
      }, 250);
    }
  }
  done();
});

//watch sass

gulp.task("watch-sass", function (done) {
  gulp
    .watch(
      ["src/assets/scss/*.scss", "src/templates/**/*.scss"],
      gulp.series("sass", "blox:build")
    )
    .on("change", stackReload);
  var timer = null;
  function stackReload(file) {
    if (timer) clearTimeout(timer);
    if (!gulp.isRunning) {
      timer = setTimeout(function () {
        browserSync.reload();
      }, 250);
    }
  }
  done();
});

//watch data

gulp.task("watch-data", function (done) {
  gulp
    .watch("src/data/*.json", gulp.series("blox:build"))
    .on("change", stackReload);
  var timer = null;
  function stackReload(file) {
    if (timer) clearTimeout(timer);
    if (!gulp.isRunning) {
      timer = setTimeout(function () {
        browserSync.reload();
      }, 250);
    }
  }
  done();
});

/**********
SERVE
***********/

gulp.task("browser-sync", function () {
  browserSync.init({
    server: {
      baseDir: "./public",
    },
    notify: false,
  });
});

/**********
CLEAN
***********/

gulp.task("clean", function () {
  return gulp.src("public", { read: false, allowEmpty: true }).pipe(clean());
});

/**********
BUILD
***********/

gulp.task("build-custom", gulp.series("images", "webmanifest", "sass"));

gulp.task("build", gulp.series("clean", "build-custom", "blox:build"));

/***********************************
DEFAULT (DEV BUILD)
***********************************/

gulp.task(
  "default",
  gulp.series(
    "clean",
    gulp.parallel(
      "watch-templates",
      "watch-scripts",
      "watch-sass",
      "watch-data"
    ),
    "blox:dev",
    "build-custom",
    "browser-sync"
  )
);
