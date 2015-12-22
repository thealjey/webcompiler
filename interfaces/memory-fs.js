declare module 'memory-fs' {
  declare class exports {
    readFileSync(path: string): {toString: () => string};
  }
}
