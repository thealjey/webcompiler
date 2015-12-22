type WebPackStats = {toJson: () => {errors: Array<string>, warnings: Array<string>}};
type WebPackCallback = (error: ?string, stats: WebPackStats) => void;

declare module 'webpack' {
  declare var exports: (config: Object, callback: ?WebPackCallback) => Object;
}
