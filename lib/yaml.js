'use strict';

exports.__esModule = true;
exports.yaml = yaml;

var _jsYaml = require('js-yaml');

var _fs = require('fs');

/**
 * Read the contents of a YAML file
 *
 * @function yaml
 * @param {string}                filename - the full system path to a YAML file
 * @param {ObjectOrErrorCallback} callback - a callback function
 * @example
 * import {yaml} from 'webcompiler';
 * // or - import {yaml} from 'webcompiler/lib/yaml';
 * // or - var yaml = require('webcompiler').yaml;
 * // or - var yaml = require('webcompiler/lib/yaml').yaml;
 * import {join} from 'path';
 * import {logError} from 'webcompiler';
 *
 * yaml(join(__dirname, 'config', 'config.yaml'), (error, data) => {
 *   if (error) {
 *     return logError(error);
 *   }
 *   // the parsed config object
 * });
 */
function yaml(filename, callback) {
  try {
    const yamlString = (0, _fs.readFileSync)(filename, 'utf8');

    callback(null, (0, _jsYaml.safeLoad)(yamlString, { filename }));
  } catch (e) {
    callback(e, {});
  }
}