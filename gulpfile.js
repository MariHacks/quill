require('dotenv').config();

var gulp = require('gulp');
var sass = require('gulp-sass');
var browserify = require('browserify');
var browserifyNgAnnotate = require('browserify-ngannotate');
var buffer = require('gulp-buffer');
var cleanCss = require('gulp-clean-css');
var concat = require('gulp-concat');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');

var environment = process.env.NODE_ENV;

var nodemon = require('gulp-nodemon');

function swallowError (error) {
    //If you want details of the error in the console
    console.log(error.toString());
    this.emit('end');
}

gulp.task('default', function(){
  console.log('yo. use gulp watch or something');
});

gulp.task('js', function () {
  var b = browserify({
    entries: 'src/app.js',
    debug: environment === "dev",
    transform: [browserifyNgAnnotate]
  });

  // transform streaming contents into buffer contents (because gulp-sourcemaps does not support streaming contents)
  return b.bundle()
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(ngAnnotate())
    .on('error', swallowError)
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('build'));
});

gulp.task('sass', function() {
  return gulp.src('stylesheets/site.scss')
    .pipe(sass())
      .on('error', sass.logError)
    .pipe(cleanCss())
    .pipe(gulp.dest('build'));
});

gulp.task('build', gulp.parallel('js', 'sass'));

gulp.task('watch', gulp.series(gulp.parallel('js', 'sass'), done => {
  gulp.watch('src/**/*.js', gulp.series('js'));
  gulp.watch('views/**/*.js', gulp.series('js'));
  gulp.watch('stylesheets/**/*.scss', gulp.series('sass'));
  done();
}));

gulp.task('server', gulp.series('watch', done => {
  nodemon({
    script: 'app.js',
    env: { 'NODE_ENV': process.env.NODE_ENV || 'DEV' },
    watch: [
      'server'
    ]
  });
  done();
}));
