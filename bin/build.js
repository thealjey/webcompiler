/* @flow */

import {join} from 'path';
import {JS} from '../src/JS';
import {NativeProcess} from '../src/NativeProcess';
import noop from 'lodash/noop';

const rootDir = join(__dirname, '..'),
  binDir = join(rootDir, 'bin'),
  srcDir = join(rootDir, 'src'),
  libDir = join(rootDir, 'lib'),
  testDir = join(rootDir, 'test'),
  interfacesDir = join(rootDir, 'interfaces'),
  js = new JS(),
  npm = new NativeProcess('npm');

js.be(srcDir, libDir, [testDir, binDir, interfacesDir], () => {
  npm.run(stderr => {
    if (stderr) {
      return console.error(stderr);
    }
    npm.run(noop, ['test'], {stdio: 'inherit'});
  }, ['run', 'docs-build'], {stdio: 'inherit'});
});
