const {src, dest, watch, parallel, series } = require('gulp');

const scss = require('gulp-sass');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const del = require('del');


function browsersync() {
    browserSync.init({
        server: "./app"
    });
}

function images() {
    return src ('app/images/**/*')
    .pipe(imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.mozjpeg({quality: 75, progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
            plugins: [
                {removeViewBox: true},
                {cleanupIDs: false}
            ]
        })
    ]
    ))
    .pipe(dest('dist/images'))
}

function cleanDist () {
    return del('dist')
}

function styles() {
  return src('app/scss/style.scss')
    .pipe(sourcemaps.init())
    .pipe(scss({outputStyle: 'compressed'}))
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer({
        overrideBrowserslist: ['last 10 version'],
        grid: true        
    }))
    .pipe(sourcemaps.write())
    .pipe(dest('app/css/'))
    .pipe(browserSync.stream());
}

function build() {
    return src([
        'app/css/style.min.css',
        'app/fonts/**/*',
        'app/*.html',
        'app/js/**/*',
    ], {base: 'app'})
    .pipe(dest('dist'))
    
}


function watching () {
    watch(['app/scss/**/*.scss'], styles);
    watch('app/*.html').on('change', browserSync.reload);
}



exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.images = images;
exports.cleanDist = cleanDist;


exports.build = series(cleanDist, images, build);
exports.default = parallel(styles, browsersync, watching);