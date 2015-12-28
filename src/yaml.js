/* @flow */

import {safeLoad} from 'js-yaml';
import {readFileSync} from 'fs';

/**
 * Invoked on operation success or failure
 *
 * @callback YAMLCallback
 * @param {string} [error] - an error message
 * @param {Object} data    - the parsed object
 */
export type YAMLCallback = (error: ?string, data: Object) => void;

/**
 * Read the contents of a YAML file
 *
 * @function yaml
 * @param {string}       filename - the full system path to a YAML file
 * @param {YAMLCallback} callback - a callback function
 * @example
 * import {yaml} from 'webcompiler';
 * import {join} from 'path';
 *
 * yaml(join(__dirname, 'config', 'config.yml'), function (error, data) {
 *   if (error) {
 *     return console.error(error);
 *   }
 *   // the parsed config object
 * });
 */
export function yaml(filename: string, callback: YAMLCallback) {
  try {
    const yamlString: string = readFileSync(filename, 'utf8');

    callback(null, safeLoad(yamlString, {filename}));
  } catch (e) {
    callback(e.toString(), {});
  }
}
