/* @flow */

import type {NativeProcess} from './NativeProcess';
import {join} from 'path';
import noop from 'lodash/noop';
import {logError} from './logger';
import {findBinary} from './findBinary';

const cwd = process.cwd(),
  defaultOptions = {
    inputDir: join(cwd, 'src'),
    outputDir: join(cwd, 'docs'),
    readMe: join(cwd, 'README.md'),
    template: join(cwd, 'node_modules', 'docdash'),
    jsdocConfig: join(__dirname, '..', 'jsdoc.json')
  };

/**
 * Generates API documentation
 *
 * The default JSDoc plugin specified in `jsdocConfig` strips out all of the code from a file while retaining newlines
 * (unlike the built in `commentsOnly` plugin that ships with JSDoc3).
 *
 * That way:
 * 1. line numbers are preserved in the source view
 * 2. you don't need to use a pre-compiler, you will always see the same code as you wrote in the docs source view
 * 3. since JSDoc only sees comments you can use any code syntax you like - ES2015, ES7, JSX, it doesn't even have to be
 * JavaScript.
 *
 * The markdown plugin is also included by default.
 *
 * @class Documentation
 * @param {DocumentationConfig} [config={}] - a configuration object
 * @example
 * import {Documentation} from 'webcompiler';
 * // or - import {Documentation} from 'webcompiler/lib/Documentation';
 * // or - var Documentation = require('webcompiler').Documentation;
 * // or - var Documentation = require('webcompiler/lib/Documentation').Documentation;
 *
 * const docs = new Documentation();
 *
 * docs.run();
 */
export class Documentation {

  /**
   * documentation generator configuration object
   *
   * @member {DocumentationConfig} options
   * @memberof Documentation
   * @private
   * @instance
   */
  options: Object;

  /* eslint-disable require-jsdoc */
  constructor(options: Object = {}) {
    /* eslint-enable require-jsdoc */
    this.options = {...defaultOptions, ...options};
  }

  /**
   * Generate the documentation
   *
   * @memberof Documentation
   * @instance
   * @method run
   * @param {Function} [callback=function () {}] - a callback function
   */
  run(callback: () => void = noop) {
    findBinary('jsdoc', (error, jsdoc: NativeProcess) => {
      if (error) {
        return logError(error);
      }
      const {inputDir, outputDir, readMe, template, jsdocConfig} = this.options;

      jsdoc.run(stderr => {
        if (stderr) {
          return logError(stderr);
        }
        callback();
      }, [inputDir, '-d', outputDir, '-R', readMe, '-c', jsdocConfig, '-t', template]);
    });
  }

}
