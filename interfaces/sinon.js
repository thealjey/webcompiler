type Spy = {
  callCount: number
};

type Stub = {
  returns: (obj: any) => void,
  returnsArg: (i: number) => void,
  throws: (err: Error) => void,
  callsArg: (i: number) => void,
  callsArgWith: (i: number, ...args: Array<any>) => void
};

declare module 'sinon' {
  declare function spy(obj: ?any, method: ?string): Spy;
  declare function stub(obj: ?any, method: ?string, func: ?(...args: Array<any>) => any): Stub;
  declare var match: {func: void, instanceOf: (obj: any) => void};
}
