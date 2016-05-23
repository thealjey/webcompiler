/* @flow */

/**
 * Processed application code with source maps
 *
 * @typedef {Object} ProgramData
 * @property {string} code - program code
 * @property {string} map  - source map json string
 */
export type ProgramData = {code: string, map: string};

/**
 * The JavaScript linting error object
 *
 * @typedef {Object} JSLintError
 * @property {string} message  - the error message
 * @property {string} [ruleId] - the relative linting rule
 * @property {string} filePath - the path to a file
 * @property {number} line     - the offending line number
 * @property {number} column   - the offending column number
 */
export type JSLintError = {message: string, ruleId?: string, filePath: string, line: number, column: number};

/**
 * Documentation generator configuration object
 *
 * @typedef {Object} DocumentationConfig
 * @property {string} [inputDir="src"]     - the input application code directory
 * @property {string} [outputDir="docs"]   - the output directory for the generated documentation
 * @property {string} [readMe="README.md"] - the documentation "homepage" (README.md file)
 * @property {string} [template="node_modules/ink-docstrap/template"]      - a full system path to a valid JSDoc3
 *                                                                           template directory
 * @property {string} [jsdocConfig="<webcompiler root>/config/jsdoc.json"] - a full system path to a JSDoc3
 *                                                                           configuration file
 */

/**
 * @callback ProgramDataCallback
 * @param {ProgramData} data - the program data
 */
export type ProgramDataCallback = (data: ProgramData) => void;

/**
 * @callback JSLintCallback
 * @param {Array<JSLintError>} [errors] - a collection of error objects
 */
export type JSLintCallback = (errors: ?Array<JSLintError>) => void;

/**
 * @callback NativeProcessCallback
 * @param {string} [stderr] - an error message
 * @param {string} stdout   - the process output
 */
export type NativeProcessCallback = (stderr: ?string, stdout: string) => void;

/**
 * @callback ObjectOrErrorCallback
 * @param {string} [error] - an error message
 * @param {Object} result  - the resulting object
 */
export type ObjectOrErrorCallback = (error: ?string, result: Object) => void;

/**
 * Describes a file a change in which was caught.
 *
 * @typedef {Object} WatchmanFile
 * @property {string}  name   - the relative path to a file
 * @property {number}  size   - file size in bytes
 * @property {boolean} exists - true if the file exists
 * @property {string}  type   - e.g. "f"
 */
export type WatchmanFile = {name: string, size: number, exists: boolean, type: string};

/**
 * A watchman response object.
 *
 * @typedef {Object} WatchmanResponse
 * @property {string}              root         - the path to the directory being watched
 * @property {string}              subscription - random subscription name
 * @property {Array<WatchmanFile>} files        - an array of file descriptions
 */
export type WatchmanResponse = {root: string, subscription: string, files: Array<WatchmanFile>};

/**
 * @callback WatchCallback
 * @param {WatchmanResponse} response - a watchman response object
 */
export type WatchCallback = (response: WatchmanResponse) => void;
