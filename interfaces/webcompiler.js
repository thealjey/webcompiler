/* @flow */

import type {ProgramData, ProgramDataCallback, StringOrErrorCallback, ResultOrErrorCallback,
  ObjectOrErrorCallback, DevServerConfig, LintError, LintCallback, PostCSSWarning, NodeSassError} from '../src/typedef';

declare module 'webcompiler' {

  declare class NativeProcess {
    constructor(task: string): void;
    run(callback: ?StringOrErrorCallback, args: ?string[], opts: ?Object): void;
    kill(): void;
  }

  declare class Documentation {
    constructor(config: ?Object): void;
    run(callback: () => void): void;
  }

  declare function flatten(...args: any[]): any[];
  declare function arrayToJSX(arr: ?Array<string | Object>): any[];
  declare function htmlToArray(html: ?string): Array<string | Object>;
  declare function htmlToJSX(html: ?string): any[];
  declare function markdownToArray(markdown: ?string): Array<string | Object>;
  declare function markdownToJSX(markdown: ?string): any[];
  declare function markdownToHTML(markdown: ?string): string;
  declare function highlightHTML(code: ?string): string;
  declare function highlightArray(code: ?string): Array<string | Object>;
  declare function highlightJSX(code: ?string): string;

  declare function watch(dir: string, type: string, callback: () => void): void;
  declare function yaml(filename: string, callback: ObjectOrErrorCallback): void;
  declare function findBinary(name: string, callback: ResultOrErrorCallback): void;

  declare class Message {}

  declare var consoleStyles: {
    bold(msg: string | number | Message): Message;
    dim(msg: string | number | Message): Message;
    italic(msg: string | number | Message): Message;
    underline(msg: string | number | Message): Message;
    inverse(msg: string | number | Message): Message;
    hidden(msg: string | number | Message): Message;
    strikethrough(msg: string | number | Message): Message;
    black(msg: string | number | Message): Message;
    red(msg: string | number | Message): Message;
    green(msg: string | number | Message): Message;
    yellow(msg: string | number | Message): Message;
    blue(msg: string | number | Message): Message;
    magenta(msg: string | number | Message): Message;
    cyan(msg: string | number | Message): Message;
    white(msg: string | number | Message): Message;
    gray(msg: string | number | Message): Message;
    grey(msg: string | number | Message): Message;
    bgBlack(msg: string | number | Message): Message;
    bgRed(msg: string | number | Message): Message;
    bgGreen(msg: string | number | Message): Message;
    bgYellow(msg: string | number | Message): Message;
    bgBlue(msg: string | number | Message): Message;
    bgMagenta(msg: string | number | Message): Message;
    bgCyan(msg: string | number | Message): Message;
    bgWhite(msg: string | number | Message): Message;
  };

  declare function log(...messages: Array<string | number | Message>): void;
  declare function logError(error: Error): void;
  declare function logPostCSSWarnings(warnings: PostCSSWarning[]): void;
  declare function logSASSError(error: NodeSassError): void;
  declare function logLintingErrors(errors: LintError[], prefix: ?string): void;

  declare var babelBEOptions: Object;
  declare var babelFEOptions: Object;

  declare class JSLint {
    constructor(configFile: ?string): void;
    run(paths: string[], callback: LintCallback): void;
  }

  declare class JSCompiler {
    constructor(compress: ?boolean): void;
    be(inPath: string, outPath: string, callback: ?() => void): void;
    fe(inPath: string, outPath: string, callback: ?() => void): void;
  }

  declare class SASSLint {
    constructor(configFile: ?string): void;
    run(paths: string[], callback: LintCallback): void;
  }

  declare class SASSCompiler {
    constructor(compress: ?boolean, includePaths: ?string[], importOnceOptions: ?Object): void;
    addPostcssPlugins(...plugins: any[]): SASSCompiler;
    postcss(path: string, data: ProgramData, callback: ProgramDataCallback): void;
    fe(inPath: string, outPath: string, callback: ?() => void): void;
  }

  declare class JS {
    compiler: JSCompiler;
    constructor(compress: ?boolean, configFile: ?string): void;
    typecheck(callback: () => void): void;
    lint(paths: string[], callback: () => void): void;
    be(inPath: string, outPath: string, lintPaths: ?string[], callback: ?() => void): void;
    fe(inPath: string, outPath: string, lintPaths: ?string[], callback: ?() => void): void;
  }

  declare class SASS {
    compiler: SASSCompiler;
    constructor(compress: ?boolean, includePaths: ?string[], configFile: ?string, importOnceOptions: ?Object): void;
    lint(paths: string[], callback: () => void): void;
    fe(inPath: string, outPath: string, lintPaths: ?string[], callback: ?() => void): void;
  }

  declare class DevServer {
    constructor(script: string, options: ?DevServerConfig): void;
    watchSASS(): void;
    watchJS(): void;
    run(): void;
  }

}
