const { src, dest, parallel, series, watch } = require('gulp')

const sass = require('gulp-sass')(require('sass'))
const sourcemaps = require('gulp-sourcemaps')
const autoprefixer = require('gulp-autoprefixer')
const clean = require('gulp-clean-css')
const concat = require('gulp-concat')
const browserSync = require('browser-sync').create()
const fileinclude = require('gulp-file-include')
const htmlmin = require('gulp-htmlmin')
const imagemin = require('gulp-imagemin')
const webp = require('gulp-webp')
const change = require('gulp-changed')
const svgSprite = require('gulp-svg-sprite')
const ttf2woff = require('gulp-ttf2woff')
const ttf2woff2 = require('gulp-ttf2woff2')
const terser = require('gulp-terser')
const del = require('del')

/* Html task */

const html = () => {
  return src('src/**/*.html')
    .pipe(fileinclude())
    .pipe(
      htmlmin({
        collapseWhitespace: true,
      })
    )
    .pipe(dest('build'))
    .pipe(browserSync.stream())
}

/* Scss task */

const style = () => {
  return src('src/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass.sync({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(
      autoprefixer({
        cascade: false,
        grid: true,
        overrideBrowserslist: ['last 2 versions'],
      })
    )
    .pipe(clean({ level: { 2: {} } }))
    .pipe(concat('style.min.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('build/css'))
    .pipe(browserSync.stream())
}

/* Js task */

const script = () => {
  return src('src/js/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(concat('main.js'))
    .pipe(
      terser({
        toplevel: true,
      })
    )
    .pipe(sourcemaps.write('./'))
    .pipe(dest('build/js'))
    .pipe(browserSync.stream())
}

/* Img task */

const images = () => {
  return src('src/images/**/*.{jpg,jpeg,png}')
    .pipe(change('build/images'))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 80, progressive: true }),
        imagemin.optipng({ optimizationLevel: 2 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(webp({ quality: 50 }))
    .pipe(dest('build/images'))
    .pipe(browserSync.stream())
}

/* SVG task */

const svg = () => {
  return src('src/icons/*.svg')
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: '../sprite.svg',
          },
        },
      })
    )
    .pipe(dest('build/icons'))
}

/* Font */

const fonts = () => {
  src('src/fonts/**.ttf').pipe(ttf2woff()).pipe(dest('build/fonts'))
  return src('src/fonts/**.ttf').pipe(ttf2woff2()).pipe(dest('build/fonts'))
}

/*Watching  */

const watching = () => {
  browserSync.init({
    server: {
      baseDir: './build',
    },
  })
  watch('src/scss/**/*.scss', style)
  watch('src/**/*.html', html)
  watch('src/js/**/*js', script)
  watch('src/images/**', images)
  watch('src/icons/*.svg', svg)
  watch('src/fonts/**.tff', fonts)
}

const cleanBuild = () => {
  return del('build')
}

/* Exports Tasks */

exports.html = html
exports.style = style
exports.watching = watching

exports.default = series(
  cleanBuild,
  parallel(html, script, fonts, images, svg),
  style,
  watching
)
