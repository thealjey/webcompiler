/* @flow */

declare module 'js-yaml' {
  declare function safeLoad(yaml: string, config: {filename: string}): Object;
}
