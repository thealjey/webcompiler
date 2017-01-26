/* @flow */

type ESLintMessage = {
  message: string;
  ruleId?: string;
  line: number;
  column: number;
  filePath: string;
};
type ESLintResult = {
  filePath: string;
  messages: Array<ESLintMessage>;
};

declare module 'eslint' {
  declare class CLIEngine {
    options: {configFile: string};
    constructor(config: Object): void;
    executeOnFiles(files: Array<string>): {results: Array<ESLintResult>};
  }
}
