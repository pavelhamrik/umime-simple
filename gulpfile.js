const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');

const dist = './docs';
const paths = {
    assets: {
        src: './src/assets/**/*',
        dest: dist + '/assets/'
    },
    styles: {
        src: './src/**/*.scss',
        dest: dist + '/assets/'
    },
    sass: ['./node_modules/foundation-sites/scss']
};

gulp.task('default', ['styles', 'copy', 'watch']);

// todo: build task minify etc
// gulp.task('build', ['styles', 'copy']);

gulp.task('styles', function () {
    return gulp.src(paths.styles.src)
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: paths.sass
        }).on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.styles.dest));
});

gulp.task('copy', function () {
    return gulp.src(paths.assets.src)
        .pipe(gulp.dest(paths.assets.dest));
});

gulp.task('watch', function () {
    gulp.watch(paths.styles.src, ['styles']);
    gulp.watch(paths.assets.src, ['copy']);
});