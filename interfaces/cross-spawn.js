/* @flow */

import EventEmitter from 'events';

declare class SpawnedChild extends EventEmitter {
  stdout?: EventEmitter;
  stderr?: EventEmitter;
  kill(): void;
}

declare module 'cross-spawn' {
  declare function exports(task: string, args: string[], options: Object): SpawnedChild;
}
