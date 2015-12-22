declare module 'uglify-js' {
  declare function minify(file: string, config: Object): {code: string, map: string};
}
