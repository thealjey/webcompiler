/* @flow */

import type {PostCSSWarning} from '../src/typedef';

type PostCSSResult = {
  css: string;
  map: Object;
  warnings(): Array<PostCSSWarning>;
};

type PostCSSPromise = {
  then(onFulfilled: (result: PostCSSResult) => void, onRejected: (error: Error) => void): void;
};

declare module 'postcss' {
  declare function exports(plugins: Array<any>): {process: (code: string, config: Object) => PostCSSPromise};
}
