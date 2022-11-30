let gulp = require('gulp'),
  sass = require('gulp-sass')(require('sass')),
  rename = require('gulp-rename'),
  browserSync = require('browser-sync'),
  autoprefixer = require('gulp-autoprefixer'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  cssmin = require('gulp-cssmin')

// prettier-ignore
gulp.task('sass', function () {
  return gulp.src('app/scss/**/*.scss')
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(rename({suffix: '.min'}))
    .pipe(autoprefixer({overrideBrowserslist: ['last 8 versions']}))
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({stream: true}))
})

// prettier - ignore
gulp.task('script', function () {
  return gulp
    .src(['node_modules/ismobilejs/dist/isMobile.min.js'])
    .pipe(concat('libs.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('app/js'))
})
gulp.task('mainScript', function () {
  return gulp
    .src(['app/js/main.js'])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('app/js'))
})

// prettier-ignore
gulp.task('style', function () {
  return gulp.src([
    'node_modules/normalize.css/normalize.css', 
  ])
  .pipe(concat('libs.min.css'))
  .pipe(cssmin())
  .pipe(gulp.dest('app/css'))
})

// prettier-ignore
gulp.task('html', function () {
  return gulp.src('app/*.html')
    .pipe(browserSync.reload({ stream: true }))
})

// prettier-ignore
gulp.task('js', function () {
  return gulp.src('app/*.js')
    .pipe(browserSync.reload({ stream: true }))
})

gulp.task('browser-sync', function () {
  browserSync.init({
    server: {
      baseDir: 'app/',
    },
  })
})

gulp.task('watch', function () {
  gulp.watch('app/scss/style.scss', gulp.parallel('sass')),
    gulp.watch('app/*.html', gulp.parallel('html')),
    gulp.watch('app/*.js', gulp.parallel('js'))
})

gulp.task(
  'default',
  gulp.parallel(
    'style',
    'mainScript',
    'script',
    'sass',
    'watch',
    'browser-sync'
  )
)
