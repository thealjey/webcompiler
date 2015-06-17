/* @flow */

import path from 'path';
import mkdirp from 'mkdirp';
import {lintJS, flow, packageJS} from '../lib/compiler';
import NativeProcess from '../lib/NativeProcess';

var rootDir = path.join(__dirname, '..'),
    libDir = path.join(rootDir, 'lib'),
    buildDir = path.join(rootDir, 'build');

mkdirp(buildDir,
  lintJS.bind(null,
    [libDir, __filename],
    flow.run.bind(flow,
      packageJS.bind(null, path.join(libDir, 'NativeProcess.js'), path.join(buildDir, 'NativeProcess.js'),
        packageJS.bind(null, path.join(libDir, 'compiler.js'), path.join(buildDir, 'compiler.js'),
          function compiled() {
            (new NativeProcess(path.join(rootDir, 'node_modules', '.bin', 'jsdoc'))).run(Function.prototype, [
              buildDir,
              '-d', path.join(rootDir, 'docs'),
              '-P', path.join(rootDir, 'package.json'),
              '-R', path.join(rootDir, 'README.md')
            ]);
          }
        )
      )
    )
  )
);
