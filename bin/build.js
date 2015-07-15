/* @flow */

import {join} from 'path';
import JS from '../lib/JS';
import NativeProcess from '../lib/NativeProcess';

var rootDir = join(__dirname, '..'),
    buildDir = join(rootDir, 'build'),
    libDir = join(rootDir, 'lib'),
    docsDir = join(rootDir, 'docs'),
    specDir = join(rootDir, 'spec'),
    readme = join(rootDir, 'README.md'),
    js = new JS(),
    jsdoc = new NativeProcess(join(rootDir, 'node_modules', '.bin', 'jsdoc'));

js.beDir(libDir, buildDir, function () {
  jsdoc.run(function (e) {
    if (e) {
      return console.error(e);
    }
    console.log('\x1b[32mGenerated API documentation!\x1b[0m');
  }, [buildDir, '-d', docsDir, '-R', readme]);
}, specDir, __filename);
