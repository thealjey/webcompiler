# webcompiler
*Lint, type-check, compile, package and gzip JavaScript (ES6 + Flow static types + JSX), for the browser as well as
NodeJS; lint, compile, auto-prefix, minify and gzip SASS.*

[Project Home](https://github.com/thealjey/webcompiler)
|
[API Docs](https://thealjey.github.io/webcompiler)

[![Build Status](https://travis-ci.org/thealjey/webcompiler.svg?branch=master)](https://travis-ci.org/thealjey/webcompiler)
[![Coverage Status](https://coveralls.io/repos/thealjey/webcompiler/badge.svg?branch=master&service=github)](https://coveralls.io/github/thealjey/webcompiler?branch=master)
[![Code Climate](https://codeclimate.com/github/thealjey/webcompiler/badges/gpa.svg)](https://codeclimate.com/github/thealjey/webcompiler)
[![Dependency Status](https://david-dm.org/thealjey/webcompiler.svg)](https://david-dm.org/thealjey/webcompiler)
[![devDependency Status](https://david-dm.org/thealjey/webcompiler/dev-status.svg)](https://david-dm.org/thealjey/webcompiler#info=devDependencies)
[![peerDependency Status](https://david-dm.org/thealjey/webcompiler/peer-status.svg)](https://david-dm.org/thealjey/webcompiler#info=peerDependencies)
[![npm version](https://badge.fury.io/js/webcompiler.svg)](http://badge.fury.io/js/webcompiler)
[![Slack channel](https://img.shields.io/badge/slack-webcompiler-blue.svg)](https://webcompiler.slack.com/messages/general)

### Prerequisites

1. [Facebook Flow](http://flowtype.org/)
2. [SCSS-Lint](https://github.com/brigade/scss-lint)
2. [Watchman](https://facebook.github.io/watchman/)

Important! Create a .flowconfig file at the root of your project with the following contents:

```
[ignore]
.*/invalidPackageJson/*
.*/build/*
.*/node_modules/.*/test/*
.*/node_modules/.*/spec/*

[include]

[libs]

[options]
suppress_comment=.*@noflow.*
```

### Installation

```
npm i webcompiler --save
```

### Exposes 3 main classes

`DevServer` - A lightweight development server that rapidly recompiles the JavaScript and SASS files when they are
              edited and updates the page.

```
interface DevServer {
  constructor(script: string, style: string, devDir: string, port: number = 3000, react: boolean = true);
  watchSASS(watchDir: string);
  watchJS();
  run(watchDir: string);
}
```

`JS` - lints, type-checks, compiles, packages, minifies and gzips JavaScript for the browser and NodeJS

```
interface JS {
  constructor(lintRules: Object = {});
  validate(inPath: string, lintPaths: Array<string>, callback: Function);
  feDev(inPath: string, outPath: string, callback: Function, ...lintPaths: Array<string>);
  feProd(inPath: string, outPath: string, callback: Function, ...lintPaths: Array<string>);
  beFile(inPath: string, outPath: string, callback: Function, ...lintPaths: Array<string>);
  beDir(inPath: string, outPath: string, callback: Function, ...lintPaths: Array<string>);
}
```
`SASS` - lints, compiles, packages, adds vendor prefixes, minifies and gzips SASS for the browser

```
interface SASS {
  constructor(excludeLinter: Array<string> = [], importOnceOptions: Object = {}, includePaths: Array<string> = []);
  validate(inPath: string, lintPaths: Array<string>, callback: Function);
  feDev(inPath: string, outPath: string, callback: Function, ...lintPaths: Array<string>);
  feProd(inPath: string, outPath: string, callback: Function, ...lintPaths: Array<string>);
}
```

### Arguments

1. `script` - a full system path to a JavaScript file
2. `style` - a full system path to a SASS file
3. `devDir` - a full system path to a directory in which to put any compiled development resources
4. `port` - a port at which to start the dev server
5. `react` - false to disable the react hot loader plugin
6. `watchDir` - the directory in which to watch for the changes in the SASS files
7. `inPath` - a full system path to the input file/directory
8. `outPath` - a full system path to the output file/directory
9. `callback` - a callback function, executed after the successful compilation
10. `lintPaths` - paths to files/directories to lint (the input file is included automatically)

### Example usage

```javascript
import {DevServer} from 'webcompiler';
import {join} from 'path';

const rootDir = join(__dirname, '..'),
    devDir = join(rootDir, 'development'),
    server = new DevServer(join(devDir, 'script.js'), join(devDir, 'app.scss'), devDir);

server.run(rootDir);
```

### Important!

The resulting JavaScript and CSS files from `feProd` are gzip compressed for performance
(see [Gzip Components](https://developer.yahoo.com/performance/rules.html#gzip)), so make sure to provide a
**"Content-Encoding"** header to the browser (e.g. `res.setHeader('Content-Encoding', 'gzip');`).

### Additional info

1. [ESLint](https://github.com/eslint/eslint), [babel-eslint](https://github.com/babel/babel-eslint),
[ESLint-plugin-Babel](https://github.com/babel/eslint-plugin-babel),
[ESLint-plugin-React](https://github.com/yannickcr/eslint-plugin-react) and
[ESLint-plugin-Lodash](https://github.com/yannickcr/eslint-plugin-react) are used to lint the JavaScript
2. [Facebook Flow](http://flowtype.org/) is used to type-check the JavaScript
3. [Babel](https://babeljs.io/) is used to compile the JavaScript
4. [webpack](http://webpack.github.io/) is used to package the JavaScript
5. [UglifyJS 2](https://github.com/mishoo/UglifyJS2) is used to compress the JavaScript
6. [SCSS-Lint](https://github.com/brigade/scss-lint) is used to lint SASS
7. [node-sass](https://github.com/sass/node-sass) and [Import Once](https://github.com/at-import/node-sass-import-once)
are used to compile SASS
8. [PostCSS](https://github.com/postcss/postcss) and [Autoprefixer](https://github.com/postcss/autoprefixer)
are used to automatically add the browser vendor prefixes to the generated CSS
9. [Clean-css](https://github.com/jakubpawlowicz/clean-css) is used to compress the CSS
10. [Watchman](https://facebook.github.io/watchman/) is used to watch for directory changes
