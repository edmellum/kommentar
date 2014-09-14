var browserSync = require('browser-sync');
var gulp        = require('gulp');

gulp.task('browserSync', ['build'], function() {
  browserSync({
    proxy: 'localhost:8000',
    files: [
      // Watch everything in build
      "./**.js",
      "./**.jsx",
      "./**.json",
      // Exclude sourcemap files
      "!build/**.map"
    ]
  });
});
