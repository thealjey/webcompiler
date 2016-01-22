declare module 'babel-core' {
  declare function transformFile(file: string, options: Object,
                                 callback: (error: ?string, result: {code: string, map: string}) => void): void;
  declare class OptionManager {
    init(options: Object): Object;
  }
}
