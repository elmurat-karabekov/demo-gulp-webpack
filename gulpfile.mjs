import gulp from 'gulp';

import * as devTasks from './gulp/dev.mjs';
import * as prodTasks from './gulp/prod.mjs';

export const clean = devTasks.clean;
export const serve = devTasks.serve;
export const build = devTasks.build;
export const dist = prodTasks.dist;
export default devTasks.watch;
