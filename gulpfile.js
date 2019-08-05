( () => { 

  'use strict';

  /*** gulpfile.js configuration  ***/
  const

    // development or production
    devBuild = ( (process.env.NODE_ENV || 'development').trim().toLowerCase() === 'development'),

    // directory locations
    dir = {
      src          : 'src/',
      build        : 'build/'
    },

    // modules
    gulp           = require('gulp'),
    noop           = require('gulp-noop'),
    newer          = require('gulp-newer'),
    size           = require('gulp-size'),
    imagemin       = require('gulp-imagemin'),
    sass           = require('gulp-sass'),
    postcss        = require('gulp-postcss'),
    concat         = require('gulp-concat'),
    deporder       = require('gulp-deporder'),
    stripdebug     = require('gulp-strip-debug'),
    uglify         = require('gulp-uglify'),
    sourcemaps     = devBuild ? require('gulp-sourcemaps') : null,
    browsersync    = devBuild ? require('browser-sync').create() : null;

  console.log('Gulp', devBuild ?  'development' : 'production', 'build');

  /*** images task ***/
  const imgConfig = {
    src            : dir.src + 'images/**/*',
    build          : dir.build + 'images/',

    minOpts: {
      optimizationLevel: 5
    }
  };

  gulp.task('images', (done) => {

    gulp.src(imgConfig.src)
      .pipe(newer(imgConfig.build))
      .pipe(imagemin(imgConfig.minOpts))
      .pipe(size({ showFiles:true }))
      .pipe(gulp.dest(imgConfig.build))
    
    done();

});

  /*** CSS task ***/
  const cssConfig = {

    src             : dir.src + 'scss/site.scss',
    watch           : dir.src + 'scss/**/*',
    build           : dir.build + 'css/',
    sassOpts: {
      sourceMap       : devBuild,
      outputStyle     : 'nested',
      imagePath       : '../images/',
      precision       : 3,
      errLogToConsole : true
    },

    postCSS: [
      require('postcss-assets')({
        loadPaths: ['images/'],
        basePath: dir.build
      }),
      require('autoprefixer')({
        browsers: ['> 1%']
      })
    ]

  };

  // remove unused selectors and minify production CSS
  if (!devBuild) {
    cssConfig.postCSS.push(
      require('usedcss')({ html: ['index.html', '404.html']}),
      require('cssnano')
    );
  }

  gulp.task('css', gulp.series('images', (done) => {

    gulp.src(cssConfig.src)
      .pipe(sourcemaps ? sourcemaps.init() : noop())
      .pipe(sass(cssConfig.sassOpts).on('error', sass.logError))
      .pipe(postcss(cssConfig.postCSS))
      .pipe(sourcemaps ? sourcemaps.write() : noop())
      .pipe(size({ showFiles:true }))
      .pipe(gulp.dest(cssConfig.build))
      .pipe(browsersync ? browsersync.reload({ stream: true }) : noop())
    
    done();
  }));

 /*** JavaScript task ***/
  const jsbuild = {
    src             : dir.src + 'js/**/*',
    build           : dir.build + 'js/',
    file            : 'main.min.js'
  };

  gulp.task('js', (done) => {

    gulp.src(jsbuild.src)
      .pipe(deporder())
      .pipe(concat(jsbuild.file))
      .pipe(devBuild ? noop() : stripdebug())
      .pipe(devBuild ? noop() : uglify())
      .pipe(gulp.dest(jsbuild.build))
    done();
  });

/*** browser-sync task ***/
const syncConfig = {
  server: {
    baseDir          : './',
    index            : 'index.html'
  },
  port               : 8000,
  files              : dir.build + '**/*',
  open               : false
};

// browser-sync
gulp.task('browsersync', (done) => {
  browsersync ? browsersync.init(syncConfig) : null
  done();
});

/*** watch-task ***/
gulp.task('default', gulp.series('css', 'js', 'browsersync', (done) => {

  // image changes
  gulp.watch(imgConfig.src, gulp.parallel(['images']));

  // CSS changes
  gulp.watch(cssConfig.watch, gulp.parallel(['css']));

   // JS changes
  gulp.watch(jsbuild.src, gulp.parallel(['js']));
  done();
}));

})();

