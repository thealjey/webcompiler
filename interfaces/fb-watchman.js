import EventEmitter from 'events';

declare module 'fb-watchman' {
  declare class Client extends EventEmitter {
    capabilityCheck(config: Object, callback: (error: ?string) => void): void;
    command(cmd: Array<any>, callback: (error: ?string, result: Object) => void): void;
  }
}
