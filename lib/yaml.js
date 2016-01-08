'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.yaml = yaml;

var _jsYaml = require('js-yaml');

var _fs = require('fs');

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
 * yaml(join(__dirname, 'config', 'config.yml'), (error, data) => {
 *   if (error) {
 *     return console.error(error);
 *   }
 *   // the parsed config object
 * });
 */

/**
 * Invoked on operation success or failure
 *
 * @callback YAMLCallback
 * @param {string} [error] - an error message
 * @param {Object} data    - the parsed object
 */
function yaml(filename, callback) {
  try {
    var yamlString = (0, _fs.readFileSync)(filename, 'utf8');

    callback(null, (0, _jsYaml.safeLoad)(yamlString, { filename: filename }));
  } catch (e) {
    callback(e.toString(), {});
  }
}