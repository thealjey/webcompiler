/* @flow */

type NodeSassError = {
  message: string;
  file: string;
  line: number;
  column: number;
};
type NodeSassCallback = (error: ?NodeSassError, result: {css: string; map: string;}) => void;

declare module 'node-sass' {
  declare function render(options: Object, callback: NodeSassCallback): void;
}
