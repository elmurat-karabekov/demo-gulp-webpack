// global
import gulp from 'gulp';
import plumber from 'gulp-plumber'; // Prevent pipe breaking caused by errors from gulp plugins
import changed, { compareContents } from 'gulp-changed'; // Only pass through changed files
import replace from 'gulp-replace'; // A string replace plugin for gulp

//html related
import fileInclude from 'gulp-file-include';
import htmlMinify from 'html-minifier';
import webpHTML from 'gulp-webp-retina-html';
import typograf from 'gulp-typograf';

// css/sass related
import gulpSass from 'gulp-sass'; // sass plugin for gulp
import * as dartSass from 'sass'; // sass compiler (dart version)
const sass = gulpSass(dartSass);

import sassGlob from 'gulp-sass-glob'; // use global imports (@import "vars/**/*.scss")
import postcss from 'gulp-postcss';

// image/assets related
import imagemin from 'gulp-imagemin';
import imageminWebp from 'imagemin-webp';
import rename from 'gulp-rename';

import svgSprite from 'gulp-svg-sprite';

// js related
import webpack from 'webpack-stream';
import config from '../webpack.config.mjs';
import babel from 'gulp-babel'; // write latest syntax, transpile old syntax for browser support

// server related
import browserSync from 'browser-sync';
const server = browserSync.create();

import { deleteAsync } from 'del';

import * as options from './configs.mjs';

export function html() {
  return gulp
    .src([
      './src/html/**/*.html',
      '!./**/blocks/**/*.*',
      '!./src/html/docs/**/*.*',
    ])
    .pipe(changed('./dist/'))
    .pipe(plumber(options.plumberNotify('HTML')))
    .pipe(fileInclude(options.fileIncludeSettings))
    .pipe(
      replace(/<img(?:.|\n|\r)*?>/g, function (match) {
        return match.replace(/\r?\n|\r/g, '').replace(/\s{2,}/g, ' ');
      })
    )
    .pipe(typograf(options.typografOptions))
    .pipe(webpHTML(options.webpHTMLOptions))
    .on('data', function (file) {
      const buferFile = Buffer.from(
        htmlMinify.minify(file.contents.toString(), options.htmlMinifyOptions)
      );
      return (file.contents = buferFile);
    })
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.reload({ stream: true }));
}

export function scss() {
  return (
    gulp
      .src('./src/scss/*.scss')
      .pipe(changed('./dist/css/'))
      .pipe(plumber(options.plumberNotify('SCSS')))
      .pipe(sassGlob()) /* Первый */
      .pipe(sass()) /* Второй */
      // .pipe(
      // 	webImagesCSS({
      // 		mode: 'webp',
      // 	})
      // )
      .pipe(
        replace(
          /(['"]?)(\.\.\/)+(img|images|fonts|css|scss|sass|js|files|audio|video)(\/[^\/'"]+(\/))?([^'"]*)\1/gi,
          '$1$2$3$4$6$1'
        )
      )
      .pipe(postcss(options.postcssPlugins))
      .pipe(gulp.dest('./dist/css/'))
  );
}

export function images() {
  return gulp
    .src(['./src/img/**/*', '!./src/img/svgicons/**/*'], { encoding: false })
    .pipe(changed('./dist/img/'))
    .pipe(
      imagemin([
        imageminWebp({
          quality: 85,
        }),
      ])
    )
    .pipe(rename({ extname: '.webp' }))
    .pipe(gulp.dest('./dist/img/'))
    .pipe(gulp.src('./src/img/**/*'), { encoding: false })
    .pipe(changed('./dist/img/'))
    .pipe(
      imagemin(
        [
          imagemin.gifsicle({ interlaced: true }),
          imagemin.mozjpeg({ quality: 85, progressive: true }),
          imagemin.optipng({ optimizationLevel: 5 }),
        ],
        { verbose: true }
      )
    )
    .pipe(gulp.dest('./dist/img/'));
}

export function js() {
  return gulp
    .src('./src/js/*.js')
    .pipe(changed('./dist/js/'))
    .pipe(plumber(options.plumberNotify('JS')))
    .pipe(babel())
    .pipe(webpack(config))
    .pipe(gulp.dest('./dist/js/'))
    .pipe(server.reload({ stream: true }));
}

export function svgStackSprite() {
  return gulp
    .src('./src/img/svgicons/**/*.svg')
    .pipe(plumber(options.plumberNotify('SVG:dev')))
    .pipe(svgSprite(options.svgStack))
    .pipe(gulp.dest('./dist/img/svgsprite/'))
    .pipe(server.reload({ stream: true }));
}

export function svgSymbolSprite() {
  return gulp
    .src('./src/img/svgicons/**/*.svg')
    .pipe(plumber(options.plumberNotify('SVG:dev')))
    .pipe(svgSprite(options.svgSymbol))
    .pipe(gulp.dest('./dist/img/svgsprite/'))
    .pipe(server.reload({ stream: true }));
}

export function fonts() {
  return gulp
    .src('./src/fonts/**/*')
    .pipe(changed('./dist/fonts/'))
    .pipe(gulp.dest('./dist/fonts/'))
    .pipe(server.reload({ stream: true }));
}

export function watchFiles() {
  gulp.watch(['./src/scss/**/*.scss'], scss);
  gulp.watch(['./src/html/**/*.html', './src/html/**/*.json'], html);
  gulp.watch(['./src/img/**/*'], images);
  gulp.watch(['./src/fonts/**/*'], fonts);
  gulp.watch(['./src/js/**/*.js'], js);
  gulp.watch(
    ['./src/img/svgicons/*'],
    gulp.series(svgStackSprite, svgSymbolSprite)
  );
}

export function serve() {
  server.init({
    server: {
      baseDir: './dist',
    },
  });
}

export function clean() {
  return deleteAsync('dist');
}

export const dist = gulp.series(
  clean,
  gulp.parallel(
    html,
    scss,
    js,
    images,
    gulp.series(svgSymbolSprite, svgStackSprite)
  )
);
