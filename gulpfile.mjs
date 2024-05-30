import gulp from 'gulp';

import * as devTasks from './gulp/dev.mjs';
import * as prodTasks from './gulp/prod.mjs';

// gulp.task(
//   'default',
//   gulp.series(
//     'clean:dev',
//     'fontsDev',
//     gulp.parallel(
//       'html:dev',
//       'sass:dev',
//       'images:dev',
//       gulp.series('svgStack:dev', 'svgSymbol:dev'),
//       'files:dev',
//       'js:dev',
//     ),
//     gulp.parallel('server:dev', 'watch:dev'),
//   ),
// );

// gulp.task(
//   'docs',
//   gulp.series(
//     'clean:docs',
//     'fontsDocs',
//     gulp.parallel(
//       'html:docs',
//       'sass:docs',
//       'images:docs',
//       gulp.series('svgStack:docs', 'svgSymbol:docs'),
//       'files:docs',
//       'js:docs',
//     ),
//     'server:docs',
//   ),
// );

export const clean = devTasks.clean;
export const scss = devTasks.scss;
export const images = devTasks.images;
export const js = devTasks.js;
export const svg = devTasks.svgSymbolSprite;
export const serve = devTasks.serve;
export const build = devTasks.build;
export default devTasks.watch;
