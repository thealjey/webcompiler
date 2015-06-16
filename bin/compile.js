/* @flow */

import path from 'path';
import mkdirp from 'mkdirp';
import {lintJS, flow, packageJS} from '../lib/compiler';

var libDir = path.join(__dirname, '..', 'lib'), buildDir = path.join(__dirname, '..', 'build');

mkdirp(buildDir, lintJS.bind(null, [libDir, __filename], flow.run.bind(flow, function batch() {
  packageJS(path.join(libDir, 'NativeProcess.js'), path.join(buildDir, 'NativeProcess.js'));
  packageJS(path.join(libDir, 'compiler.js'), path.join(buildDir, 'compiler.js'));
})));
