# webcompiler

[![NPM](https://nodei.co/npm/webcompiler.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/webcompiler/)

Lint, type-check, compile, package and gzip JavaScript (ES6 + Flow static types + JSX), for the browser as well as
NodeJS; lint, compile, auto-prefix, minify and gzip SASS.

**[Project Home](https://github.com/thealjey/webcompiler) | [API Docs](https://thealjey.github.io/webcompiler) | [Changelog](https://github.com/thealjey/webcompiler/blob/master/CHANGELOG.md) | [Discord]**

[![Node.js](https://img.shields.io/node/v/webcompiler.svg)](https://www.npmjs.com/package/webcompiler)
[![Version](https://badge.fury.io/js/webcompiler.svg)](https://badge.fury.io/js/webcompiler)
[![Build Status](https://travis-ci.org/thealjey/webcompiler.svg?branch=master)](https://travis-ci.org/thealjey/webcompiler)
[![Coverage Status](https://coveralls.io/repos/thealjey/webcompiler/badge.svg?branch=master&service=github)](https://coveralls.io/github/thealjey/webcompiler?branch=master)
[![Code Climate](https://codeclimate.com/github/thealjey/webcompiler/badges/gpa.svg)](https://codeclimate.com/github/thealjey/webcompiler)
[![Dependency Status](https://www.versioneye.com/user/projects/589118066a0b7c003b834564/badge.svg)](https://www.versioneye.com/user/projects/589118066a0b7c003b834564)
[![Downloads](https://img.shields.io/npm/dm/webcompiler.svg)](https://www.npmjs.com/package/webcompiler)
[![License](https://img.shields.io/npm/l/webcompiler.svg)](https://www.npmjs.com/package/webcompiler)

Webpack is an amazing tool, however it requires a lot of boilerplate to properly setup and configure, especially when
you use it on more than one project.

ESLint is constantly updated, new rules are added, APIs are changed. Properly configuring it is a routine and time
consuming task, which is completely impractical to perform on each project separately.

APIs are sometimes changed without any change in functionality (e.g. Babel 5 vs Babel 6).

This project aims to abstract all of those problems out of the development of applications and provide the simplest possible interface, pre-configured with everything set up and ready to use right after the installation.

`babel-polyfill`, `autoprefixer`, fast rebuilds with caching in development, production tree shaking, optimizations and compression that care even about your users public cache, everything completely automatic and baked into the library.

Have fun :)

### Feedback

What did you struggle with?

Any feedback on **[Discord]** would be greatly appreciated. It does not require registration and won't take more than a few minutes of your time.

### Prerequisites

1. [Watchman] \(only required by the `watch` function and the `DevServer` class; you don't need to know how it works, all you need to do is install it)

### A note about [Facebook Flow]

[Facebook Flow] is a static analysis tool used to check your JavaScript code for possible errors
at compile time.

It is very smart at understanding your program code, however you should not rely on it being smart enough to just
understand your external dependencies too.

It can do that, the problem is that a typical NodeJS project can contain hundreds of NPM modules, with thousands of
JavaScript files.

It is a very complicated task, even for a tool that smart, to parse all of them and stay performant enough to not only
be usable but useful as well.

Which is why it must not be allowed to even try to understand any files that reside in a `node_modules` directory.

[Interface Files](http://flowtype.org/docs/declarations.html) must be used instead.

You can find examples of such interface files, as well as the interface file for the tool itself, in the `interfaces` directory.

### Installation

```bash
npm i webcompiler --save-dev
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

### Troubleshooting

#### `watch`

1. If you've installed [Watchman] on OSX with homebrew and you notice that it suddenly stopped working, try the following:
  * `launchctl unload -F ~/Library/LaunchAgents/com.github.facebook.watchman.plist`
  * `rm -rf /usr/local/var/run/watchman/`
  * reinstall [Watchman] completely
  * if that does not solve your problem or the above steps do not apply to you report a bug describing your operating system version, [Watchman] version, webcompiler version, and your specific problem

[Discord]: https://discord.gg/0blXIxApyTu9qXno
[Facebook Flow]: http://flowtype.org/
[Watchman]: https://facebook.github.io/watchman/docs/install.html
