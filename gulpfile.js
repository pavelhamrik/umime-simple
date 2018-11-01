const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const babel = require('gulp-babel');
const browserSync = require('browser-sync').create();
const panini = require('panini');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const named = require('vinyl-named');

const DIST = './docs';
const PORT = '8008';
const PATHS = {
    assets: {
        src: './src/assets/**/*',
        dist: DIST + '/assets/'
    },
    scripts: {
        src: ['./src/**/*.exercise.js', '!./src/**/_*.js'],
        dist: DIST + '/assets/scripts/'
    },
    styles: {
        src: './src/**/*.scss',
        dist: DIST + '/assets/'
    },
    pages: {
        src: './src/pages/',
        dist: DIST
    },
    sass: [
        './node_modules/foundation-sites/scss'
    ]
};

const WEBPACK_CONFIG = {
    mode: 'development',
};

function logError(error) {
    console.log(error);
}

gulp.task('default', ['pages', 'scripts', 'styles', 'copy', 'browser', 'watch']);

// todo: build task minify etc
// gulp.task('build', ['styles', 'copy']);

gulp.task('scripts', function () {
    return gulp.src(PATHS.scripts.src)
        .pipe(plumber({errorHandler: logError()}))
        .pipe(named())
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(webpackStream(WEBPACK_CONFIG, webpack, function(err, stats) {
            console.log(err);
        }))
        .on('error', logError)
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(PATHS.scripts.dist))
        .pipe(browserSync.stream());
});

gulp.task('styles', function () {
    return gulp.src(PATHS.styles.src)
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: PATHS.sass
        }).on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(PATHS.styles.dist))
        .pipe(browserSync.stream());
});

gulp.task('pages', function () {
    return gulp.src(PATHS.pages.src + 'pages/**/*.{html,hbs,handlebars}')
        .pipe(panini({
            root: PATHS.pages.src + 'pages/',
            layouts: PATHS.pages.src + 'layouts/',
            partials: PATHS.pages.src + 'partials/',
            data: PATHS.pages.src + 'data/',
            helpers: PATHS.pages.src + 'helpers/'
        }))
        .pipe(gulp.dest(PATHS.pages.dist));
});

gulp.task('pages-refresh', function (done) {
    panini.refresh();
    done();
});

gulp.task('copy', function () {
    return gulp.src(PATHS.assets.src)
        .pipe(gulp.dest(PATHS.assets.dist));
});

gulp.task('browser', function () {
    browserSync.init({
        server: DIST,
        port: PORT
    });
});

gulp.task('browser-reload', function () {
    browserSync.reload();
});

gulp.task('watch', function () {
    gulp.watch(PATHS.scripts.src, ['scripts'], ['browser-reload']);
    gulp.watch(PATHS.styles.src, ['styles']);
    gulp.watch(PATHS.assets.src, ['copy', 'browser-reload']);
    gulp.watch(PATHS.pages.src + '**/*', ['pages-refresh', 'pages', 'browser-reload']);
});
