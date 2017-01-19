/* @flow */

import {Documentation} from '../src/Documentation';
import {log, consoleStyles} from '../src/logger';
import {createReadStream, createWriteStream} from 'fs';
import {join} from 'path';

const rootDir = join(__dirname, '..'),
  docsDir = join(rootDir, 'docs'),
  docs = new Documentation(),
  {green} = consoleStyles;

docs.run(() => {
  createReadStream(join(rootDir, 'LICENSE')).pipe(createWriteStream(join(docsDir, 'LICENSE')));
  createReadStream(join(rootDir, 'README.md')).pipe(createWriteStream(join(docsDir, 'README.md')));
  log(green('Generated API documentation!'));
});
