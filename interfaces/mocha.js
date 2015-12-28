type MochaCallback = (done: ?() => void) => void;

declare function describe(name: string, callback: MochaCallback): void;
declare function it(name: string, callback: MochaCallback): void;
declare function beforeEach(callback: MochaCallback): void;
declare function afterEach(callback: MochaCallback): void;
