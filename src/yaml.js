/* @flow */

import type {ObjectOrErrorCallback} from './typedef';
import {safeLoad} from 'js-yaml';
import {readFileSync} from 'fs';

/**
 * Read the contents of a YAML file
 *
 * @function yaml
 * @param {string}                filename - the full system path to a YAML file
 * @param {ObjectOrErrorCallback} callback - a callback function
 * @example
 * import {yaml} from 'webcompiler';
 * import {join} from 'path';
 *
 * yaml(join(__dirname, 'config', 'config.yml'), (error, data) => {
 *   if (error) {
 *     return console.error(error);
 *   }
 *   // the parsed config object
 * });
 */
export function yaml(filename: string, callback: ObjectOrErrorCallback) {
  try {
    const yamlString: string = readFileSync(filename, 'utf8');

    callback(null, safeLoad(yamlString, {filename}));
  } catch (e) {
    callback(e.toString(), {});
  }
}
