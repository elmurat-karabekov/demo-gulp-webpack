// global
import gulp from 'gulp';
import plumber from 'gulp-plumber'; // Prevent pipe breaking caused by errors from gulp plugins
import changed, { compareContents } from 'gulp-changed'; // Only pass through changed files
import replace from 'gulp-replace'; // A string replace plugin for gulp

// html related
import fileInclude from 'gulp-file-include'; // include partial html files inside other html file
import typograf from 'gulp-typograf'; // Помогает автоматически расставить неразрывные пробелы, исправить мелкие опечатки, привести кавычки к правильному виду, заменить дефисы на тире в нужных местах и многое другое
import prettier from 'gulp-prettier'; // Format files with Prettier

// Replaces the <img> tag with <picture> <source> <img> in HTML files.
// **/images/ should include retina version of images @2x.[ext]
import webpHTML from 'gulp-webp-retina-html';

// sass related
import gulpSass from 'gulp-sass'; // sass plugin for gulp
import * as dartSass from 'sass'; // sass compiler (dart version)
const sass = gulpSass(dartSass);

import sassGlob from 'gulp-sass-glob'; // use global imports (@import "vars/**/*.scss")
import sourceMaps from 'gulp-sourcemaps'; // source map (to from which folder does code come from in dev tools inspection, ex: "_animations.scss")

// image/assets related
import imagemin from 'gulp-imagemin';
import imageminWebp from 'imagemin-webp';
import rename from 'gulp-rename';

// svg related
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
    .pipe(changed('./build/', { hasChanged: compareContents }))
    .pipe(plumber(options.plumberNotify('HTML')))
    .pipe(fileInclude(options.fileIncludeSettings))
    .pipe(
      replace(/<img(?:.|\n|\r)*?>/g, function (match) {
        return match.replace(/\r?\n|\r/g, '').replace(/\s{2,}/g, ' ');
      })
    ) // Удаляет лишние пробелы и переводы строк внутри тега <img>
    .pipe(
      replace(
        /(?<=src=|href=|srcset=)(['"])(\.(\.)?\/)*(img|images|fonts|css|scss|sass|js|files|audio|video)(\/[^\/'"]+(\/))?([^'"]*)\1/gi,
        '$1./$4$5$7$1'
      ) // Правка относительных путей, для картинок
    )
    .pipe(typograf(options.typografOptions))
    .pipe(webpHTML(options.webpHTMLOptions))
    .pipe(prettier(options.prettierOptions))
    .pipe(gulp.dest('./build'))
    .pipe(server.reload({ stream: true }));
}

export function scss() {
  return gulp
    .src('./src/scss/*.scss')
    .pipe(changed('./build/css/'))
    .pipe(plumber(options.plumberNotify('SCSS')))
    .pipe(sourceMaps.init())
    .pipe(sassGlob())
    .pipe(sass())
    .pipe(
      replace(
        /(['"]?)(\.\.\/)+(img|images|fonts|css|scss|sass|js|files|audio|video)(\/[^\/'"]+(\/))?([^'"]*)\1/gi,
        '$1$2$3$4$6$1'
      ) // Правка относительных путей, для картинок
    )
    .pipe(sourceMaps.write())
    .pipe(gulp.dest('./build/css/'))
    .pipe(server.reload({ stream: true }));
}

export function images() {
  return (
    gulp
      .src(['./src/img/**/*', '!./src/img/svgicons/**/*'], {
        encoding: false,
      })
      .pipe(changed('./build/img/'))
      .pipe(
        imagemin([
          imageminWebp({
            quality: 85,
          }),
        ])
      )
      .pipe(rename({ extname: '.webp' }))
      .pipe(gulp.dest('./build/img/'))
      .pipe(
        gulp.src(
          [
            './src/img/**/*.{jpg,png,svg,gif,ico,webp}',
            '!./src/img/svgicons/**/*',
          ],
          { encoding: false } // without this jpg images are not copied properly, mb bug
        )
      )
      .pipe(changed('./build/img/'))
      // .pipe(imagemin({ verbose: true }))
      .pipe(gulp.dest('./build/img'))
      .pipe(server.reload({ stream: true }))
  );
}

export function js() {
  return (
    gulp
      .src('./src/js/*.js')
      .pipe(changed('./build/js/'))
      .pipe(plumber(options.plumberNotify('JS')))
      // .pipe(babel()) --
      .pipe(webpack(config))
      .pipe(gulp.dest('./build/js/'))
      .pipe(server.reload({ stream: true }))
  );
}

export function svgStackSprite() {
  return gulp
    .src('./src/img/svgicons/**/*.svg')
    .pipe(plumber(options.plumberNotify('SVG:dev')))
    .pipe(svgSprite(options.svgStack))
    .pipe(gulp.dest('./build/img/svgsprite/'))
    .pipe(server.reload({ stream: true }));
}

export function svgSymbolSprite() {
  return gulp
    .src('./src/img/svgicons/**/*.svg')
    .pipe(plumber(options.plumberNotify('SVG:dev')))
    .pipe(svgSprite(options.svgSymbol))
    .pipe(gulp.dest('./build/img/svgsprite/'))
    .pipe(server.reload({ stream: true }));
}

export function fonts() {
  return gulp
    .src('./src/fonts/**/*')
    .pipe(changed('./build/fonts/'))
    .pipe(gulp.dest('./build/fonts/'))
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
      baseDir: './build',
    },
  });
}

export function clean() {
  return deleteAsync('build');
}

export const build = gulp.series(
  clean,
  gulp.parallel(
    html,
    scss,
    js,
    images,
    gulp.series(svgSymbolSprite, svgStackSprite)
  )
);

export const watch = gulp.series(build, gulp.parallel(watchFiles, serve));
