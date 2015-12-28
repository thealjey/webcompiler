/* @flow */

import {join} from 'path';
import {JS} from '../src/JS';
import {NativeProcess} from '../src/NativeProcess';

const rootDir = join(__dirname, '..'),
    binDir = join(rootDir, 'bin'),
    srcDir = join(rootDir, 'src'),
    libDir = join(rootDir, 'lib'),
    testDir = join(rootDir, 'test'),
    js = new JS(),
    npm = new NativeProcess('npm'),

    /* @flowignore */
    emptyFn: () => void = Function.prototype;

js.be(srcDir, libDir, [testDir, binDir], () => {
  npm.run(stderr => {
    if (stderr) {
      return console.error(stderr);
    }
    npm.run(emptyFn, ['test'], {stdio: 'inherit'});
  }, ['run', 'docs-build'], {stdio: 'inherit'});
});
