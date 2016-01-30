/* @flow */

import type {ProgramData} from '../src/typedef';

declare module 'babel-core' {
  declare function transformFile(file: string, options: Object,
                                 callback: (error: ?string, result: ProgramData) => void): void;
}
