/* @flow */

import Documentation from '../src/Documentation';
import {createReadStream, createWriteStream} from 'fs';
import {join} from 'path';

const rootDir = join(__dirname, '..'),
    docsDir = join(rootDir, 'docs'),
    docs = new Documentation();

docs.run(() => {
  createReadStream(join(rootDir, 'LICENSE')).pipe(createWriteStream(join(docsDir, 'LICENSE')));
  createReadStream(join(rootDir, 'README.md')).pipe(createWriteStream(join(docsDir, 'README.md')));
  console.log('\x1b[32mGenerated API documentation!\x1b[0m');
});
