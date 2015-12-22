# webcompiler
*Lint, type-check, compile, package and gzip JavaScript (ES6 + Flow static types + JSX), for the browser as well as
NodeJS; lint, compile, auto-prefix, minify and gzip SASS.*

[Project Home](https://github.com/thealjey/webcompiler)
|
[API Docs](https://thealjey.github.io/webcompiler)
|
[Discord](https://discord.gg/0blXIxApyTu9qXno)

[![Build Status](https://travis-ci.org/thealjey/webcompiler.svg?branch=master)](https://travis-ci.org/thealjey/webcompiler)
[![Coverage Status](https://coveralls.io/repos/thealjey/webcompiler/badge.svg?branch=master&service=github)](https://coveralls.io/github/thealjey/webcompiler?branch=master)
[![Code Climate](https://codeclimate.com/github/thealjey/webcompiler/badges/gpa.svg)](https://codeclimate.com/github/thealjey/webcompiler)
[![Dependency Status](https://david-dm.org/thealjey/webcompiler.svg)](https://david-dm.org/thealjey/webcompiler)
[![devDependency Status](https://david-dm.org/thealjey/webcompiler/dev-status.svg)](https://david-dm.org/thealjey/webcompiler#info=devDependencies)
[![npm version](https://badge.fury.io/js/webcompiler.svg)](https://www.npmjs.com/package/webcompiler)
[![downloads](https://img.shields.io/npm/dm/webcompiler.svg)](https://www.npmjs.com/package/webcompiler)

Webpack is an amazing tool, however it requires a lot of boilerplate to properly setup and configure, especially when
you use it on more than one project.

ESLint is constantly updated, new rules are added, APIs are changed. Properly configuring it is a routine and time
consuming task, which is completely impractical to perform on each project separately.

APIs are sometimes changed without any change in functionality (e.g. Babel 5 vs Babel 6).

This project aims to abstract all of those problems out of the development of applications.

### Prerequisites

1. [Facebook Flow](http://flowtype.org/)
2. [SCSS-Lint](https://github.com/brigade/scss-lint)
2. [Watchman](https://facebook.github.io/watchman/)

### A note about [Facebook Flow](http://flowtype.org/)

[Facebook Flow](http://flowtype.org/) is a static analysis tool used to check your JavaScript code for possible errors
at compile time.

It is very smart at understanding your program code, however you should not rely on it being smart enough to just
understand your external dependencies too.

It can do that, the problem is that a typical NodeJS project can contain hundreds NPM modules, with thousands of
JavaScript files.

It is a very complicated task, even for a tool that smart, to parse all of them and stay performant enough to not only
be usable but useful as well.

Which is why it must not be allowed to even try to understand any files that reside in a `node_modules` directory.

[Interface Files](http://flowtype.org/docs/declarations.html) must be used instead.

You can find examples of such interface files, as well as the interface file for the tool itself, in the `interfaces` directory.

### Installation

```bash
npm i webcompiler --save
```

### Production builds

By default all compilation is done in development mode.

If you wish to compile for production just set the `NODE_ENV` environment variable to `"production"`, the following
additional actions will be performed by the compiler:

1. advanced compilation time optimizations
2. minification (only `fe` in `production` mode)
3. g-zip compression (only `fe` in `production` mode)

### Important!

The resulting JavaScript and CSS files from `fe` in `production` mode are gzip compressed for performance
(see [Gzip Components](https://developer.yahoo.com/performance/rules.html#gzip)), so make sure to provide a
**"Content-Encoding"** header to the browser (e.g. `res.setHeader('Content-Encoding', 'gzip');`).
