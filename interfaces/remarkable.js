/* @flow */

declare module 'remarkable' {
  declare class exports {
    constructor(preset: string, options: Object): void;
    render(markdown: string): string;
  }
}
