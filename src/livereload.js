/* @flow */

import type {LiveReloadTrigger} from './typedef';
import tinylr from 'tiny-lr';

const LIVERELOAD_PORT = 35729;

let reloadFn;

/**
 * Starts a LiveReload server and returns a function that triggers the reload.
 *
 * @function livereload
 * @return {LiveReloadTrigger} the trigger function
 * @example
 * <link rel="stylesheet" href="css/style.css">
 * @example
 * import {livereload} from 'webcompiler';
 * // or - import {livereload} from 'webcompiler/lib/livereload';
 * // or - var livereload = require('webcompiler').livereload;
 * // or - var livereload = require('webcompiler/lib/livereload').livereload;
 *
 * // initialize the server
 * const lr = livereload();
 *
 * // only reload the styles
 * lr('css/style.css');
 *
 * // refresh the whole page
 * lr('*');
 * // or simply
 * lr();
 */
export function livereload(): LiveReloadTrigger {
  if (!reloadFn) {
    const lr = tinylr();

    lr.listen(LIVERELOAD_PORT);

    reloadFn = (file: string = '*') => {
      lr.changed({body: {files: [file]}});
    };
  }

  return reloadFn;
}
