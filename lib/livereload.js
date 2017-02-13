'use strict';

exports.__esModule = true;
exports.livereload = livereload;

var _tinyLr = require('tiny-lr');

var _tinyLr2 = _interopRequireDefault(_tinyLr);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
function livereload() {
  if (!reloadFn) {
    const lr = (0, _tinyLr2.default)();

    lr.listen(LIVERELOAD_PORT);

    reloadFn = (file = '*') => {
      lr.changed({ body: { files: [file] } });
    };
  }

  return reloadFn;
}