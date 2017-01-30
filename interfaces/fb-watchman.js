/* @flow */

/* eslint-disable no-unused-vars */

import type {ObjectOrErrorCallback} from '../src/typedef';
import EventEmitter from 'events';

declare module 'fb-watchman' {
  declare class Client extends EventEmitter {
    capabilityCheck(config: Object, callback: (error: ?Error) => void): void;
    command(cmd: any[], callback: ObjectOrErrorCallback): void;
  }
}
