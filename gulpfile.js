var gulp = require('gulp');
var concat = require('gulp-concat');
var clean = require('gulp-clean');
var connect = require('gulp-connect');
var templateCache = require('gulp-angular-templatecache');
var angularFileSort = require('gulp-angular-filesort');

var packageFile = require('./package.json');

var paths = {
    'js': './src/**/*.js',
    'css': './src/**/*.css',
    'templates': './src/templates/*.tpl.html',
    'dist': 'dist'
};

var serverConfiguration = {
    name: 'Dev App',
    root: ['node_modules', 'dist', 'examples'],
    port: 8000,
    livereload: true
};

gulp.task('default', ['serve', 'watch']);

gulp.task('serve', function () {
    connect.server(serverConfiguration)
});
gulp.task('clean', cleanDist);
gulp.task('build', ['clean'], build);
gulp.task('js', jsFn);
gulp.task('css', cssFn);
gulp.task('html', htmlFn);

gulp.task('watch', watchFn);

function watchFn() {
    gulp.watch([paths.js], ['js']);
    gulp.watch([paths.css], ['css']);
    gulp.watch([paths.templates], ['html']);
}

function build() {
    cssFn();
    htmlFn();
    jsFn();
}

function htmlFn() {
    var options = {
        root: 'partials',
        standalone:true,
        moduleSystem:'IIFE',
        // angular module name
        module: 'ng-query-builder.templates'
    };

    return gulp.src([paths.templates])
        .pipe(templateCache('templates.js',options))
        .pipe(gulp.dest('./src/'))
}

function cssFn() {
    return gulp.src([paths.css])
        .pipe(concat(packageFile.name + '.min.css'))
        .pipe(gulp.dest(paths.dist))
        .pipe(connect.reload());
}

function jsFn() {
    return gulp.src([paths.js])
        .pipe(angularFileSort())
        .pipe(concat(packageFile.name + '.min.js'))
        .pipe(gulp.dest(paths.dist))
        .pipe(connect.reload());
}

function cleanDist() {
    return gulp.src(paths.dist).pipe(clean());
}