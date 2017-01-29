/* @flow */

declare module 'error-stack-parser' {
  declare class exports {
    static parse(error: Error): {
      functionName?: string;
      fileName: string;
      lineNumber: number;
      columnNumber: number;
    };
  }
}
