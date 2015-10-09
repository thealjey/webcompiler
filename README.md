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

### Exposes 2 main classes

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

1. `inPath` - a full system path to the input file/directory
2. `outPath` - a full system path to the output file/directory
3. `callback` - a callback function, executed after the successful compilation
4. `lintPaths` - paths to files/directories to lint (the input file is included automatically)

### Example usage

```javascript
import {JS} from 'webcompiler';
import {DirectoryWatcher} from 'simple-recursive-watch';
import {join} from 'path';
import tinylr from 'tiny-lr';

var compiler = new JS(),
    lr = tinylr(),
    libDir = join(__dirname, 'lib'),
    webJS = compiler.feDev.bind(compiler,
      join(libDir, 'app.js'),
      join(__dirname, 'public', 'script.js'),
      function () {
        // notify LiveReload of the file change
        lr.changed({body: {files: ['script.js']}});
      }, libDir);

lr.listen(35729);

// compile at startup
webJS();
// automatically invoke the same compiler if any of the JavaScript files change
DirectoryWatcher.watch(libDir, 'js', webJS);
```

### Important!

The resulting JavaScript and CSS files from `feProd` are gzip compressed for performance
(see [Gzip Components](https://developer.yahoo.com/performance/rules.html#gzip)), so make sure to provide a
**"Content-Encoding"** header to the browser (e.g. `res.setHeader('Content-Encoding', 'gzip');`).

### Additional info

1. [ESLint](https://github.com/eslint/eslint), [babel-eslint](https://github.com/babel/babel-eslint),
[eslint-plugin-babel](https://github.com/babel/eslint-plugin-babel) and
[ESLint-plugin-React](https://github.com/yannickcr/eslint-plugin-react) are used to lint the JavaScript
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
