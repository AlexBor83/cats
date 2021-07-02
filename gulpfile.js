const { src, dest, watch, parallel, series } = require("gulp");

const scss = require("gulp-sass");
const concat = require("gulp-concat");
const sourcemaps = require("gulp-sourcemaps");
const browserSync = require("browser-sync").create();
const autoprefixer = require("gulp-autoprefixer");
const imagemin = require("gulp-imagemin");
const svgstore = require("gulp-svgstore");
const rename = require("gulp-rename");
const ttf2woff = require("gulp-ttf2woff");
const ttfwoff2 = require("gulp-ttf2woff2");
const del = require("del");

let fs = require("fs");

function browsersync() {
  browserSync.init({
    server: "./app",
  });
}

function images() {
  return src("app/images/**/*")
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(dest("dist/images"));
}

function cleanDist() {
  return del("dist");
}

function svgsprite() {
  return src("app/images/**/*.svg")
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(dest("app/images/"));
}

function fonts() {
  src("app/fonts/*.ttf")
  .pipe(ttf2woff())
  .pipe(dest("app/fonts/dest/"));

  return src("app/fonts/*.ttf")
  .pipe(ttfwoff2())
  .pipe(dest("app/fonts/dest/"));
}

function styles() {
  return src("app/scss/style.scss")
    .pipe(sourcemaps.init())
    .pipe(scss({ outputStyle: "expanded" })) //compressed
    .pipe(concat("style.min.css"))
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 10 version"],
        grid: true,
      })
    )
    .pipe(sourcemaps.write())
    .pipe(dest("app/css/"))
    .pipe(browserSync.stream());
}

function build() {
  return src(
    [
      "app/css/style.min.css",
      "app/fonts/dest/**/*",
      "app/*.html",
      "app/js/**/*",
    ],
    { base: "app" }
  ).pipe(dest("dist"));
}

//source_folder - источник fonts.scss
// path.build.fonts - app/fonts/dest

function fontsStyle() {
  let file_content = fs.readFileSync('app/scss/bloks/fonts.scss');
  if (file_content == "") {
    fs.writeFile('app/scss/bloks/fonts.scss', "", cb);
    return fs.readdir('app/fonts/dest', function (err, items) {
      if (items) {
        let c_fontname;
        for (var i = 0; i < items.length; i++) {
          let fontname = items[i].split(".");
          fontname = fontname[0];
          if (c_fontname != fontname) {
            fs.appendFile(
              'app/scss/bloks/fonts.scss',
              '@include font("' +
                fontname +
                '", "' +
                fontname +
                '", "400", "normal");\r\n',
              cb
            );
          }
          c_fontname = fontname;
        }
      }
    });
  }
}

// function fontsStyle(params) {

//   let file_content = fs.readFileSync(source_folder + '/scss/fonts.scss');
//   if (file_content == '') {
//   fs.writeFile(source_folder + '/scss/fonts.scss', '', cb);
//   return fs.readdir(path.build.fonts, function (err, items) {
//   if (items) {
//   let c_fontname;
//   for (var i = 0; i < items.length; i++) {
//   let fontname = items[i].split('.');
//   fontname = fontname[0];
//   if (c_fontname != fontname) {
//   fs.appendFile(source_folder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
//   }
//   c_fontname = fontname;
//   }
//   }
//   })
//   }
//   }

function cb() {}

function watching() {
  watch(["app/scss/**/*.scss"], styles);
  watch("app/*.html").on("change", browserSync.reload);
}

exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.images = images;
exports.cleanDist = cleanDist;
exports.svgsprite = svgsprite;
exports.fonts = fonts;
exports.fontsStyle = fontsStyle;


exports.build = series(cleanDist, images, build);
exports.default = parallel(styles, fontsStyle,  browsersync, watching);
