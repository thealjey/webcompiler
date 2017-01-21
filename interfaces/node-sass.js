/* @flow */

import type {NodeSassError} from '../src/typedef';

type NodeSassCallback = (error: ?NodeSassError, result: {css: string; map: string;}) => void;

declare module 'node-sass' {
  declare function render(options: Object, callback: NodeSassCallback): void;
}
