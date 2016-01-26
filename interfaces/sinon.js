type Spy = {
  callCount: number
};

type Stub = {
  returns: (obj: any) => any,
  returnsArg: (i: number) => any,
  throws: (err: Error) => any,
  callsArg: (i: number) => any,
  callsArgWith: (i: number, ...args: Array<any>) => any
};

declare module 'sinon' {
  declare function spy(obj: ?any, method: ?string): Spy;
  declare function stub(obj: ?any, method: ?string, func: ?(...args: Array<any>) => any): Stub;
  declare var match: {(callback: (value: any) => boolean): void, func: void, instanceOf: (obj: any) => void};
}
