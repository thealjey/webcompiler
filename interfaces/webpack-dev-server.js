/* @flow */

declare module 'webpack-dev-server' {
  declare class exports {
    app: {get: (path: string, callback: (req: any, res: {send: (data: string) => void}) => void) => void};
    constructor(webpack: Object): void;
    listen(port: number, host: string, callback: (error: ?string) => void): void;
  }
}
