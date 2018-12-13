const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const browserSync = require('browser-sync').create();
const panini = require('panini');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const named = require('vinyl-named');
const yargs = require('yargs');
const gulpif = require('gulp-if');
const del = require('del');

const DIST = './docs';
const PORT = '8008';
const PATHS = {
    assets: {
        src: './src/assets/**/*',
        dist: './docs/assets/'
    },
    scripts: {
        src: ['./src/**/*.exercise.js', './src/**/*.app.js'],
        watch: ['./src/**/*.js'],
        dist: './docs/assets/scripts/',
    },
    styles: {
        src: './src/**/*.scss',
        dist: './docs/assets/'
    },
    pages: {
        src: './src/pages/',
        dist: './docs'
    },
    sass: [
        './node_modules/foundation-sites/scss'
    ]
};

const WEBPACK_CONFIG_DEV = {
    mode: 'development',
    plugins: [
        new webpack.DefinePlugin({
            LOG: JSON.stringify(true),
            LOCAL_IO: JSON.stringify(false),
            CHANGE_BROWSER_HISTORY: JSON.stringify(false),
            API_URL: JSON.stringify('http://localhost:3443/'),
            API_ITEMS_ENDPOINT: JSON.stringify('api/v2/bundle-assignments/'),
            API_LOG_ENDPOINT: JSON.stringify('api/v2/log/'),
            API_ERROR_ENDPOINT: JSON.stringify('api/v2/log/'),
        })
    ],
};

const WEBPACK_CONFIG_STG = {
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    }
                }
            }
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            LOG: JSON.stringify(true),
            LOCAL_IO: JSON.stringify(true),
            CHANGE_BROWSER_HISTORY: JSON.stringify(false),
            API_URL: JSON.stringify('https://phapi.herokuapp.com/'),
            API_ITEMS_ENDPOINT: JSON.stringify('api/v2/bundle-assignments/'),
            API_LOG_ENDPOINT: JSON.stringify('api/v2/log/'),
            API_ERROR_ENDPOINT: JSON.stringify('api/v2/log/'),
        })
    ],
};

const WEBPACK_CONFIG_PROD = {
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    }
                }
            }
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            LOG: JSON.stringify(false),
            LOCAL_IO: JSON.stringify(false),
            CHANGE_BROWSER_HISTORY: JSON.stringify(true),
            API_URL: JSON.stringify('https://www.umimematiku.cz/ajax/'),
            API_ITEMS_ENDPOINT: JSON.stringify('mrizkovanaLoadItems.php'),
            API_LOG_ENDPOINT: JSON.stringify('logItemDone.php'),
            API_ERROR_ENDPOINT: JSON.stringify('errorProxy.php'),
        })
    ],
};

const ENV = !!(yargs.argv.prod)
    ? 'PROD'
    : !!(yargs.argv.stg)
        ? 'STG'
        : 'DEV';

const WEBPACK_CONFIG = ENV === 'PROD'
    ? WEBPACK_CONFIG_PROD
    : ENV === 'STG'
        ? WEBPACK_CONFIG_STG
        : WEBPACK_CONFIG_DEV;

gulp.task('scripts', function () {
    return gulp.src(PATHS.scripts.src)
        .pipe(plumber())
        .pipe(named())
        .pipe(sourcemaps.init())
        .pipe(webpackStream(WEBPACK_CONFIG, webpack, function(err) {if (err) console.log(err)}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(PATHS.scripts.dist))
        .pipe(browserSync.stream());
});

gulp.task('styles', function () {
    return gulp.src(PATHS.styles.src)
        .pipe(gulpif(ENV === 'DEV', sourcemaps.init()))
        .pipe(sass({
            includePaths: PATHS.sass,
            outputStyle: 'compressed',
        }).on('error', sass.logError))
        .pipe(gulpif(ENV === 'DEV', sourcemaps.write()))
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

gulp.task('browser', function (done) {
    browserSync.init({
        server: DIST,
        port: PORT
    });
    done();
});

gulp.task('browser-reload', function (done) {
    browserSync.reload();
    done();
});

gulp.task('clean', function () {
    return del([DIST]);
});

gulp.task('watch', function () {
    gulp.watch(PATHS.scripts.watch, gulp.series('scripts'));
    gulp.watch(PATHS.styles.src, gulp.series('styles'));
    gulp.watch(PATHS.assets.src, gulp.series('copy', 'browser-reload'));
    gulp.watch(PATHS.pages.src + '**/*', gulp.series('pages-refresh', 'pages', 'browser-reload'));
});


gulp.task('default', gulp.series('pages', gulp.parallel('scripts', 'styles', 'copy'), 'browser', 'watch'));

gulp.task('build', gulp.series('clean', gulp.parallel('pages', 'scripts', 'styles', 'copy')));