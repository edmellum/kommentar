var gulp = require('gulp');
var react = require('gulp-react');
var browserSync = require('browser-sync');

require('./gulp/tasks/browserify');

gulp.task('jsx', function () {
    return gulp.src('kommentar.jsx')
        .pipe(react())
        .pipe(gulp.dest('.'));
});

gulp.task('browserSync', ['build'], function() {
  browserSync({
    proxy: 'localhost:8000',
    files: [
      // Watch everything in build
      "./**.js",
      "./**.json",
      // Exclude sourcemap files
      "!build/**.map"
    ]
  });
});

gulp.task('watch', ['jsx', 'setWatch', 'browserSync'], function() {
  gulp.watch('./**.jsx', ['jsx']);
});

gulp.task('setWatch', function() {
  global.isWatching = true;
});

gulp.task('default', ['watch']);
gulp.task('build', ['browserify']);
