var gulp = require('gulp');
var sass = require('gulp-sass');
var nodemon = require('gulp-nodemon');

var paths = {
    scss: './assets/stylesheets/*.scss'
};

gulp.task('server', function () {
    nodemon({
        script: 'server.js'
        , ext: 'js html'
          , env: { 'NODE_ENV': 'development' }
    })
});

gulp.task('styles', function(){
    return gulp.src(paths.scss)
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./public/stylesheets/'));
});

gulp.task('watch', function() {
    gulp.watch('./assets/stylesheets/*.scss', ['styles']);
});

gulp.task('default', ['server','watch','styles']);
