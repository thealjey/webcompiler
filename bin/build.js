/* @flow */

import {join} from 'path';
import {createReadStream, createWriteStream} from 'fs';
import JS from '../lib/JS';
import NativeProcess from '../lib/NativeProcess';

const rootDir = join(__dirname, '..'),
    buildDir = join(rootDir, 'build'),
    libDir = join(rootDir, 'lib'),
    docsDir = join(rootDir, 'docs'),
    specDir = join(rootDir, 'spec'),
    readme = join(rootDir, 'README.md'),
    jsdocConfig = join(rootDir, 'config', 'jsdoc.json'),
    js = new JS(),
    jsdoc = new NativeProcess(join(rootDir, 'node_modules', '.bin', 'jsdoc')),
    npm = new NativeProcess('npm');

js.beDir(libDir, buildDir, function () {
  jsdoc.run(function (jsdocErr) {
    if (jsdocErr) {
      return console.error(jsdocErr);
    }
    createReadStream(join(rootDir, 'LICENSE')).pipe(createWriteStream(join(docsDir, 'LICENSE')));
    createReadStream(join(rootDir, 'doc_readme.md')).pipe(createWriteStream(join(docsDir, 'README.md')));
    console.log('\x1b[32mGenerated API documentation!\x1b[0m');
    npm.run(Function.prototype, ['test'], {stdio: 'inherit'});
  }, [buildDir, '-d', docsDir, '-R', readme, '-c', jsdocConfig]);
}, specDir, __filename);
