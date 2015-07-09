/* @flow */

import path from 'path';
import JS from '../lib/JS';
import NativeProcess from '../lib/NativeProcess';

var rootDir = path.join(__dirname, '..'),
    buildDir = path.join(rootDir, 'build'),
    libDir = path.join(rootDir, 'lib'),
    docsDir = path.join(rootDir, 'docs'),
    specDir = path.join(rootDir, 'spec'),
    readme = path.join(rootDir, 'README.md'),
    js = new JS(),
    jsdoc = new NativeProcess(path.join(rootDir, 'node_modules', '.bin', 'jsdoc'));

js.beDir(libDir, buildDir, function () {
  jsdoc.run(function (e) {
    if (e) {
      return console.error(e);
    }
    console.log('\x1b[32mGenerated API documentation!\x1b[0m');
  }, [buildDir, '-d', docsDir, '-R', readme]);
}, specDir, __filename);
