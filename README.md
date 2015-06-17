# webcompiler
*Lint, type-check, compile, package and gzip JavaScript (ES6 + Flow static types + JSX), for the browser as well as
NodeJS; lint, compile, auto-prefix, minify and gzip SASS.*

### Prerequisites

1. [Facebook Flow](http://flowtype.org/) (0.12+)
2. [SCSS-Lint](https://github.com/brigade/scss-lint)

Important! Create a .flowconfig file at the root of your project with the following contents:

```
[ignore]
.*/invalidPackageJson/*
.*/test/*

[include]

[libs]

[options]
suppress_comment=.*@noflow.*

```

### Installation

```
npm i webcompiler --save
```

### Exposes 3 main functions

1. `webJS` - lints, type-checks, compiles, packages, minifies and gzips JavaScript for the browser
(production ready + Source Maps)
2. `nodeJS` - lints, type-checks and compiles JavaScript for NodeJS
3. `webSASS` - lints, compiles, packages, adds vendor prefixes, minifies and gzips SASS for the browser
(production ready + Source Maps)

### With the same signature

```
(inPath: string, outPath: string, onCompile: Function = Function.prototype,
 callback: Function = Function.prototype, ...lintPaths: Array<string>): void;
```

### Arguments

1. `inPath` - the source file path
2. `outPath` - the path to the compiled output file
3. `onCompile` - an optional function to execute after each successful compilation
4. `callback` - an optional callback function that receives one argument (regardless of the success of the operation), -
an optimized compiler function that can be used for continuous compilation of the same resource (a good candidate for
use with a [watcher](https://github.com/thealjey/simple-recursive-watch))
5. `...lintPaths` - the rest of the arguments, if any, are the paths to files as well as directories that you want the
linter to check (the source file being compiled is included automatically)

### Example usage

```
import {webJS} from 'webcompiler';
import watch from 'simple-recursive-watch';

webJS('lib/app.js', 'public/script.js', function () {
  // notify LiveReload of the file change
  lr.changed({body: {files: ['script.js']}});
}, function (compiler) {
  // automatically invoke the same compiler if any of the JavaScript files change
  watch('lib', 'js', compiler);
}, 'lib');
```

### Important!

The resulting JavaScript and CSS files from `webJS` and `webSASS` are gzip compressed for performance
(see [Gzip Components](https://developer.yahoo.com/performance/rules.html#gzip)), so make sure to provide a
**"Content-Encoding"** header to the browser (e.g. `res.setHeader('Content-Encoding', 'gzip');`).

### Additional info

1. [ESLint](https://github.com/eslint/eslint), [babel-eslint](https://github.com/babel/babel-eslint) and
[ESLint-plugin-React](https://github.com/yannickcr/eslint-plugin-react) are used to lint the JavaScript
2. [Facebook Flow](http://flowtype.org/) is used to type-check the JavaScript
3. [Babel](https://babeljs.io/) is used to compile the JavaScript
4. [webpack](http://webpack.github.io/) is used to package the JavaScript
5. [UglifyJS 2](https://github.com/mishoo/UglifyJS2) is used to compress the JavaScript
6. [SCSS-Lint](https://github.com/brigade/scss-lint) is used to lint SASS
7. [node-sass](https://github.com/sass/node-sass) and [Import Once](https://github.com/at-import/node-sass-import-once)
are used to compile SASS
8. [PostCSS](https://github.com/postcss/postcss) and [Autoprefixer Core](https://github.com/postcss/autoprefixer-core)
are used to automatically add the browser vendor prefixes to the generated CSS
9. [Clean-css](https://github.com/jakubpawlowicz/clean-css) is used to compress the CSS
