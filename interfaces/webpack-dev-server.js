/* @flow */

type Response = {
  send(data: string): void;
};

declare module 'webpack-dev-server' {
  declare class exports {
    app: {
      get(path: string, callback: (req: any, res: Response) => void): void;
      use(callback: (req: any, res: Response) => void): void;
    };
    constructor(webpack: Object): void;
    listen(port: number, host: string, callback: (error: ?string) => void): void;
  }
}
