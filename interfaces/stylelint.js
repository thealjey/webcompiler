/* @flow */

type StyleLintResult = {
  source: string;
  warnings: Array<{
    line: number;
    column: number;
    text: string;
    rule: string;
  }>;
};

declare module 'stylelint' {
  declare function lint(options: Object): {
    then(callback: (result: {results: StyleLintResult[]}) => void): {
      catch(callback: (error: Error) => void): void;
    };
  };
}
