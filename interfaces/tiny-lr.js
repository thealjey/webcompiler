/* @flow */

declare module 'tiny-lr' {
  declare function exports(): {
    changed(config: Object): void;
    listen(port: number): void;
  };
}
