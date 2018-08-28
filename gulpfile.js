const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const browser = require("browser-sync").create();
const panini = require("panini");


const dist = './docs';
const port = '8008';
const paths = {
    assets: {
        src: './src/assets/**/*',
        dist: dist + '/assets/'
    },
    styles: {
        src: './src/**/*.scss',
        dist: dist + '/assets/'
    },
    pages: {
        src: './src/pages/',
        dist: dist
    },
    sass: [
        './node_modules/foundation-sites/scss'
    ]
};

gulp.task('default', ['pages', 'styles', 'copy', 'browser', 'watch']);

// todo: build task minify etc
// gulp.task('build', ['styles', 'copy']);

gulp.task('styles', function () {
    return gulp.src(paths.styles.src)
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: paths.sass
        }).on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.styles.dist))
        .pipe(browser.stream());
});

gulp.task('pages', function () {
    return gulp.src(paths.pages.src + 'pages/**/*.{html,hbs,handlebars}')
        .pipe(panini({
            root: paths.pages.src + 'pages/',
            layouts: paths.pages.src + 'layouts/',
            partials: paths.pages.src + 'partials/',
            data: paths.pages.src + 'data/',
            helpers: paths.pages.src + 'helpers/'
        }))
        .pipe(gulp.dest(paths.pages.dist));
});

gulp.task('pages-refresh', function(done) {
    panini.refresh();
    done();
});

gulp.task('copy', function () {
    return gulp.src(paths.assets.src)
        .pipe(gulp.dest(paths.assets.dist));
});

gulp.task('browser', function() {
    browser.init({
        server: dist,
        port: port
    });
});

gulp.task('browser-reload', function() {
    browser.reload();
});

gulp.task('watch', function () {
    gulp.watch(paths.styles.src, ['styles']);
    gulp.watch(paths.assets.src, ['copy', 'browser-reload']);
    gulp.watch(paths.pages.src + '**/*', ['pages-refresh', 'pages', 'browser-reload']);
});
