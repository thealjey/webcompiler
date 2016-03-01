/* @flow */

declare module 'jsdom' {
  declare function jsdom(): {
    defaultView: {
      navigator: any,
      document: {
        createRange: () => {
          setEnd: () => void,
          setStart: () => void,
          getBoundingClientRect: () => {}
        }
      }
    }
  };
}
