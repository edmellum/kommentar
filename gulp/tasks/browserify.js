/* browserify task
   ---------------
   Bundle javascripty things with browserify!

   If the watch task is running, this uses watchify instead
   of browserify for faster bundling using caching.
*/

var browserify   = require('browserify');
var watchify     = require('watchify');
var bundleLogger = require('../util/bundleLogger');
var gulp         = require('gulp');
var handleErrors = require('../util/handleErrors');
var source       = require('vinyl-source-stream');

gulp.task('browserify', function() {
  var bundler = browserify({
    cache: {}, packageCache: {}, fullPaths: true,
    entries: ['./browser.js'],
    extensions: ['.jsx'],
    debug: true,
    standalone: 'kommentar'
  });

  var bundle = function() {
    // Log when bundling starts
    bundleLogger.start();

    return bundler
      .bundle()
      // Report compile errors
      .on('error', handleErrors)
      // Use vinyl-source-stream to make the
      // stream gulp compatible. Specifiy the
      // desired output filename here.
      .pipe(source('kommentar-standalone.js'))
      // Specify the output destination
      .pipe(gulp.dest('./'))
      // Log when bundling completes!
      .on('end', bundleLogger.end);
  };

  if(global.isWatching) {
    bundler = watchify(bundler);
    // Rebundle with watchify on changes.
    bundler.on('update', bundle);
  }

  return bundle();
});
