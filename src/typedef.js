/* @flow */

/**
 * Processed application code with source maps
 *
 * @typedef {Object} ProgramData
 * @property {string} code - program code
 * @property {string} map  - source map json string
 */
export type ProgramData = {
  code: string;
  map: string;
};

/**
 * A generic linting error object
 *
 * @typedef {Object} LintError
 * @property {string} file    - the path to a file
 * @property {number} line    - the offending line number
 * @property {number} column  - the offending column number
 * @property {string} message - the error message
 * @property {string} [rule]  - the name of the rule that triggered the error
 */
export type LintError = {
  file: string;
  line: number;
  column: number;
  message: string;
  rule?: string;
};

/**
 * A PostCSS warning object.
 *
 * @typedef {Object} PostCSSWarning
 * @property {number} column - the offending column number
 * @property {number} line   - the offending line number
 * @property {string} plugin - the name of the plugin that triggered the warning
 * @property {string} text   - the warning message
 * @property {Object} node   - the offending node description
 */
export type PostCSSWarning = {
  column: number;
  line: number;
  plugin: string;
  text: string;
  node: {
    source: {
      input: {
        file: string;
      };
    };
  };
};

/**
 * A Node SASS error object.
 *
 * @typedef {Object} NodeSassError
 * @property {string} file    - the path to a file
 * @property {number} line    - the offending line number
 * @property {number} column  - the offending column number
 * @property {string} message - the error message
 */
export type NodeSassError = {
  message: string;
  file: string;
  line: number;
  column: number;
};

/**
 * A configuration object that describes a console output style.
 *
 * @typedef {Object} ConsoleStyleConfig
 * @property {Array<string>} ansi - ansi start and end codes
 * @property {string}        css  - css styles
 */
export type ConsoleStyleConfig = {
  ansi: [string, string];
  css: string;
};

/**
 * Express application
 *
 * @external ExpressApplication
 * @see {@link http://expressjs.com/en/4x/api.html#app Application}
 */

/**
 * @callback ExpressApplicationCallback
 * @param {external:ExpressApplication} app - Express application
 */
export type ExpressApplicationCallback = (app: ExpressApplication) => void;

/**
 * DevServer configuration object
 *
 * @typedef {Object} DevServerConfig
 * @property {string}                     [style]                - a full system path to a SASS file
 * @property {number}                     [port=3000]            - a port at which to start the dev server
 * @property {boolean}                    [react=true]           - false to disable the react hot loader plugin
 * @property {string}                     [contentBase=CWD]      - a full system path to the server web root
 * @property {ExpressApplicationCallback} [configureApplication] - gives you a chance to configure the underlying
 *                                                                 Express application after the static root has been
 *                                                                 configured, but before the "catch all" route (sends
 *                                                                 the HTML layout) is defined
 */
export type DevServerConfig = {
  style?: string;
  port?: number;
  react?: boolean;
  contentBase?: string;
  configureApplication?: ExpressApplicationCallback;
};

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
 * @callback LintCallback
 * @param {Array<LintError>} [errors] - a collection of error objects
 */
export type LintCallback = (errors: ?LintError[]) => void;

/**
 * @callback StringOrErrorCallback
 * @param {Error}  [error] - an error object
 * @param {string} result  - the resulting string
 */
export type StringOrErrorCallback = (error: ?Error, result: string) => void;

/**
 * @callback ObjectOrErrorCallback
 * @param {Error}  [error] - an error object
 * @param {Object} result  - the resulting object
 */
export type ObjectOrErrorCallback = (error: ?Error, result: Object) => void;

/**
 * @callback ResultOrErrorCallback
 * @param {Error} [error] - an error object
 * @param {*}     result  - the resulting value
 */
export type ResultOrErrorCallback = (error: ?Error, result: any) => void;

/**
 * Describes a file a change in which was caught.
 *
 * @typedef {Object} WatchmanFile
 * @property {string}  name   - the relative path to a file
 * @property {number}  size   - file size in bytes
 * @property {boolean} exists - true if the file exists
 * @property {string}  type   - e.g. "f"
 */
export type WatchmanFile = {
  name: string;
  size: number;
  exists: boolean;
  type: string;
};

/**
 * A watchman response object.
 *
 * @typedef {Object} WatchmanResponse
 * @property {string}              root         - the path to the directory being watched
 * @property {string}              subscription - random subscription name
 * @property {Array<WatchmanFile>} files        - an array of file descriptions
 */
export type WatchmanResponse = {
  root: string;
  subscription: string;
  files: WatchmanFile[];
};

/**
 * @callback WatchCallback
 * @param {WatchmanResponse} response - a watchman response object
 */
export type WatchCallback = (response: WatchmanResponse) => void;
