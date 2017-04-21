v7.0.1 - Fri, 21 Apr 2017 09:37:20 GMT
--------------------------------------

- [2e7d0ba](../../commit/2e7d0ba) [fixed] `React.PropTypes` is deprecated in favor of the `"prop-types"` module
- [edaa3ef](../../commit/edaa3ef) [fixed] the `isNode` check for when the `process` variable exists in the browser



v7.0.0 - Wed, 05 Apr 2017 15:24:54 GMT
--------------------------------------

- [f29f23d](../../commit/f29f23d) [fixed] favor lodash over native methods
- [41c8c95](../../commit/41c8c95) [fixed] favor `eslint-disable-next-line` over disabling and then re-enabling a rule manually
- [a30d433](../../commit/a30d433) [fixed] `JS.typecheck` to disregard the contents of stderr when executing the flow typechecker, because it prints errors to stdout
- [5488581](../../commit/5488581) [fixed] the type signature of the `Documentation` constructor `options` argument
- [e0e030a](../../commit/e0e030a) [changed] constructor signatures of `Compiler`, `JSCompiler`, `SASSCompiler`, `JS` and `SASS` to allow for additional options to be passed more easily; `JSCompiler` now supports the `"library"` and `"libraryTarget"` options from webpack



v6.8.4 - Mon, 13 Mar 2017 16:35:32 GMT
--------------------------------------

- [1090c8f](../../commit/1090c8f) [changed] display relative file paths when logging errors
- [5802023](../../commit/5802023) [fixed] updated dependencies
- [7d08bf9](../../commit/7d08bf9) [fixed] renamed type `Iterable` -> `IterableCollection` in the lodash interface file to make it work with Flow >=0.38.0
- [8da6ce7](../../commit/8da6ce7) [fixed] switched from `no-invalid-this` and `semi` ESLint rules to the same rules in the `eslint-plugin-babel` package



v6.8.3 - Fri, 17 Feb 2017 16:41:37 GMT
--------------------------------------

- [da39703](../../commit/da39703) [fixed] simplified regexp pattern for error detection in `NativeProcess`



v6.8.2 - Fri, 17 Feb 2017 16:23:24 GMT
--------------------------------------

- [528c86d](../../commit/528c86d) [fixed] used `cross-spawn` instead of `child_process` in `NativeProcess` for compatibility with the Windows operating system



v6.8.1 - Tue, 14 Feb 2017 23:26:37 GMT
--------------------------------------

- [50b24dd](../../commit/50b24dd) [fixed] in development mode there is no longer a separate source map file (for performance reasons), do not attempt to read it from `memory-fs`



v6.8.0 - Mon, 13 Feb 2017 19:48:24 GMT
--------------------------------------

- [9895f9e](../../commit/9895f9e) [fixed] typo
- [f367a00](../../commit/f367a00) [added] the `livereload` helper function
- [6f1d890](../../commit/6f1d890) [fixed] added a temporary hack/fix for `react-hot-loader`, while the stable version v3 is not out yet
- [60a0dc8](../../commit/60a0dc8) [fixed] link to the license in readme



v6.7.0 - Sat, 11 Feb 2017 17:30:06 GMT
--------------------------------------

- [7c8ae19](../../commit/7c8ae19) [changed] created a new module `util`; made the `webpack` module private
- [e0e7a60](../../commit/e0e7a60) [added] function `logSequentialSuccessMessage` to the `logger` module
- [1e86281](../../commit/1e86281) [fixed] use cheaper `"eval-source-map"` in development mode when constructing a webpack compiler for faster rebuilds
- [a507dbb](../../commit/a507dbb) [fixed] removed duplicated declaration for `defaultConfigFile`
- [5520224](../../commit/5520224) [added] the `watch` method to the `Documentation` class



v6.6.1 - Sat, 11 Feb 2017 09:55:59 GMT
--------------------------------------

- [d31bb2b](../../commit/d31bb2b) [added] the "Troubleshooting" section to README.md
- [2e62ccb](../../commit/2e62ccb) [changed] added the check for the "relative_root" watchman server capability; also added client disconnection on error
- [b4de55c](../../commit/b4de55c) [fixed] updated default jsdoc configuration



v6.6.0 - Thu, 09 Feb 2017 19:50:39 GMT
--------------------------------------

- [ccc6661](../../commit/ccc6661) [fixed] a very long standing issue (it basically existed from the very beginning) by ignoring ".babelrc" files and enabling the ES2015 module syntax transpilation; tree shaking will be available again when both `webpack` 2.3 and `webpack-hot-loader` 3.0 come out
- [5396dbb](../../commit/5396dbb) [fixed] added a link to the Changelog to README.md



v6.5.0 - Tue, 07 Feb 2017 20:04:12 GMT
--------------------------------------

- [fde1a96](../../commit/fde1a96) [fixed] undated dependencies
- [d5f38d2](../../commit/d5f38d2) [fixed] removed the unreliable `webpack-combine-loaders` that broke `JSCompiler#fe` in v6
- [6d21f9e](../../commit/6d21f9e) [fixed] minor documentation issue



v6.4.0 - Sun, 05 Feb 2017 13:45:59 GMT
--------------------------------------

- [2402d0e](../../commit/2402d0e) [fixed] documentation tweaks
- [38b5f13](../../commit/38b5f13) [changed] enabled the `template-tag-spacing` ESLint rule
- [15de846](../../commit/15de846) [fixed] updated dependencies
- [bbafa14](../../commit/bbafa14) [fixed] added missing "keywords" to package.json
- [7957472](../../commit/7957472) [fixed] clarified the Watchman prerequisite in README.md



v6.3.2 - Thu, 02 Feb 2017 19:26:00 GMT
--------------------------------------

- [9c06c47](../../commit/9c06c47) [fixed] typo in README, increased the minimally required Node.js verion to 6.9.5



v6.3.1 - Thu, 02 Feb 2017 19:13:11 GMT
--------------------------------------

- [ae764a9](../../commit/ae764a9) [fixed] updated dependencies
- [bb07c67](../../commit/bb07c67) [fixed] updated documentation



v6.3.0 - Mon, 30 Jan 2017 20:40:29 GMT
--------------------------------------

- [87854f3](../../commit/87854f3) [added] the `addPostcssPlugins` method to `SASSCompiler`
- [e3bdece](../../commit/e3bdece) [fixed] updated the interface declaration for `JSLint` and `SASSLint`
- [a7faf64](../../commit/a7faf64) [fixed] updated autoprefixer
- [e56d58c](../../commit/e56d58c) [fixed] flowtype - prefer shorthand array
- [33a0c97](../../commit/33a0c97) [fixed] small formatting issues in commentsOnly.js



v6.2.0 - Sun, 29 Jan 2017 20:57:13 GMT
--------------------------------------

- [ebe1b12](../../commit/ebe1b12) [fixed] `logger.logError` is now truly cross platform and cross browser, with a cleaner stack trace
- [42d1413](../../commit/42d1413) [changed] `NativeProcess` converts `stderr` strings that look like the output of `Error.prototype.toString()` into actual error instances, preserving all of the underlying information
- [aae39ea](../../commit/aae39ea) [fixed] `NativeProcess` no longer converts the error object "toString()" in the process "error" event handler
- [6b6e2ff](../../commit/6b6e2ff) [changed] got rid of the "config" directory, moved its contents into the root directory, renamed the plugin to `commentsOnly`, as its only purpose is to replicate and enhance the standard plugin with the same name



v6.1.2 - Sun, 29 Jan 2017 16:14:20 GMT
--------------------------------------

- [8f1c984](../../commit/8f1c984) [fixed] minor syntax issues



v6.1.1 - Sun, 29 Jan 2017 15:20:19 GMT
--------------------------------------

- [cc32687](../../commit/cc32687) [fixed] updated dependencies
- [4a5d4f3](../../commit/4a5d4f3) [fixed] Github Pages can now read a subfolder contents on a `master` branch, no need for `gh-pages` anymore



v6.1.0 - Thu, 26 Jan 2017 20:15:27 GMT
--------------------------------------

- [053de5d](../../commit/053de5d) [changed] `JSLint` and `SASSLint` (also affects `JS` and `SASS`) constructors now both accept a single argument - `configFile`, which is a path to the respective configuration files of `ESLint` and `stylelint`. They both support extends, so any other configuration options are redundant.



v6.0.3 - Wed, 25 Jan 2017 17:19:16 GMT
--------------------------------------

- [3da0682](../../commit/3da0682) [fixed] escape the Windows directory separator in the `logger` module
- [544f08b](../../commit/544f08b) [fixed] updated dependencies
- [91ffe22](../../commit/91ffe22) [fixed] updated the "files" entry in package.json



v6.0.2 - Mon, 23 Jan 2017 06:48:44 GMT
--------------------------------------

- [323a94e](../../commit/323a94e) [fixed] updated autoprefixer
- [282e763](../../commit/282e763) [fixed] regression in v6.0.0, which could cause `Compiler` to gzip compress in development mode



v6.0.1 - Sun, 22 Jan 2017 09:22:06 GMT
--------------------------------------

- [e2b3f6c](../../commit/e2b3f6c) [fixed] `logger` module docs



v6.0.0 - Sun, 22 Jan 2017 09:11:37 GMT
--------------------------------------

- [099ccd4](../../commit/099ccd4) [fixed] updated docs
- [2eff57a](../../commit/2eff57a) [fixed] updated dependencies
- [c793ee3](../../commit/c793ee3) [added] `findBinary` function; switched Flow from a global prerequisite to a local `webcompiler` managed dependency - "flow-bin" (yay!)
- [b77144e](../../commit/b77144e) [fixed] typo in `consoleStyles.red` definition
- [c4f9f5b](../../commit/c4f9f5b) [fixed] increased the requirement for the Node.js version to >=6.9.4 (Latest LTS: Boron), from now on `webcompiler` will always require at least the latest LTS version of Node.js
- [8f4fad2](../../commit/8f4fad2) [fixed] updated tests
- [8b79091](../../commit/8b79091) [changed] extracted the common webpack related logic into a single centalized `webpack` module
- [91d2857](../../commit/91d2857) [changed] support only Node.js versions >=6.8.1, to remove the need to transpile ES2015 syntax on Node.js almost completely
- [47a689d](../../commit/47a689d) [fixed] use destructuring instead of `[0]` to retrieve the first element of an array
- [5669a2e](../../commit/5669a2e) [fixed] added `getClientRects` mock to `window.document.createRange` for `CodeMirror` in the `highlight` module
- [b54893e](../../commit/b54893e) [changed] switched from [scss-lint](https://github.com/brigade/scss-lint) to [stylelint](http://stylelint.io/), no more ruby dependencies (yay!)
- [0ce882d](../../commit/0ce882d) [fixed] only use the compressed outputStyle for sass, as mested is meaningless with source maps always enabled
- [836dd03](../../commit/836dd03) [changed] renamed .eslintrc.yml -> .eslintrc.yaml, to use the standard and recommended extension for YAML files
- [cf14cab](../../commit/cf14cab) [changed] `Documentation` only uses the local project level `jsdoc` executable, and throws if it is not found ignoring the global one, for a more fine-grained control over versioning
- [61e77ad](../../commit/61e77ad) [fixed] documentation of `Compiler#gzip`
- [bff7641](../../commit/bff7641) [added] the `logger` module, the isomorphic wrapper for `console.log` with ANSI 16 styles
- [8d12a47](../../commit/8d12a47) [changed] switched to [docdash](https://www.npmjs.com/package/docdash) as the new default documentation template



v5.2.4 - Wed, 07 Sep 2016 11:44:30 GMT
--------------------------------------

- [502fcdb](../../commit/502fcdb) [fixed] updated dependencies; enabled the following `ESLint` rules - `flowtype/boolean-style`, `flowtype/generic-spacing`, `flowtype/semi`, `flowtype/space-before-generic-bracket`, `flowtype/union-intersection-spacing`, `react/no-unused-prop-types`, `react/style-prop-object` and `class-methods-use-this`



v5.2.3 - Fri, 19 Aug 2016 13:36:27 GMT
--------------------------------------

- [bf56b08](../../commit/bf56b08) [fixed] updated dependencies; removed the deprecated `eslint-plugin-flow-vars` in favor of `eslint-plugin-flowtype`; removed the deprecated babel presets made unnecessary by `babel-core@6.13.0`; added interface definitions for all of the `lodash` functions (including aliases)



v5.2.2 - Mon, 08 Aug 2016 07:53:58 GMT
--------------------------------------

- [b01a743](../../commit/b01a743) [fixed] updated dependencies; added `extends` for `plugin:react/recommended` and `plugin:lodash/recommended` to `.eslintrc.yml`; sorted configured rules alphabetically



v5.2.1 - Fri, 29 Jul 2016 20:44:40 GMT
--------------------------------------

- [48dd607](../../commit/48dd607) [changed] renamed: config/scsslint.yml -> .scss-lint.yml - a useful convention for when you want editor integration for `scss-lint`. If you don't, this change is inconsequential for you. However, if you do, and since `.scss-lint.yml` does not have an extend directive, you will need to symlink to this file directly; run the following command from the root directory of your project - `ln -s "./node_modules/webcompiler/.scss-lint.yml" .scss-lint.yml`.



v5.2.0 - Wed, 27 Jul 2016 19:59:54 GMT
--------------------------------------

- [a33ef4d](../../commit/a33ef4d) [added] Font Awesome to the list of default import paths of `SASSCompiler`
- [0aca3bd](../../commit/0aca3bd) [fixed] `SASSLint` to adjust to the fact that `scss-lint` no longer prints errors to stderr, which also makes `SASS#lint` obsolete
- [70c3625](../../commit/70c3625) [removed] `webpack.NoErrorsPlugin` from DevServer, as it is no longer required by `react-hot-loader`



v5.1.1 - Mon, 25 Jul 2016 20:01:46 GMT
--------------------------------------

- [4e9391a](../../commit/4e9391a) [added] the "Feedback" section to README
- [99e3d0d](../../commit/99e3d0d) [fixed] updated dependencies



v5.1.0 - Sat, 16 Jul 2016 10:18:28 GMT
--------------------------------------

- [28318ef](../../commit/28318ef) [added] the `configureApplication` option to `DevServer`



v5.0.1 - Thu, 14 Jul 2016 07:45:03 GMT
--------------------------------------

- [730b979](../../commit/730b979) [fixed] `Compiler#fsRead` - do not proceed to reading the ".map" file after failing to read the main file



v5.0.0 - Wed, 13 Jul 2016 20:35:51 GMT
--------------------------------------

- [c84575a](../../commit/c84575a) [fixed] `Compiler#save` now skips the final write if the contents of the file have not changed since the previous write, which means that the last modified timestamp of the file is not altered unnecessarily
- [1b9ea9f](../../commit/1b9ea9f) [changed] `DevServer` api to better reflect the api of the underlying `WebpackDevServer`; sass compilation is now optional



v4.1.1 - Sat, 09 Jul 2016 08:26:11 GMT
--------------------------------------

- [d2cc0aa](../../commit/d2cc0aa) [fixed] lint the interface files
- [8310319](../../commit/8310319) [added] `DefinePlugin` to the list of production plugins of `JSCompiler#fe`
- [e1879a2](../../commit/e1879a2) [changed] `JS#compiler` and `SASS#compiler` are now public
- [32d4b65](../../commit/32d4b65) [changed] disabled UglifyJs compressor warnings



v4.1.0 - Thu, 07 Jul 2016 16:43:49 GMT
--------------------------------------

- [a114b29](../../commit/a114b29) [fixed] documentation examples for `DevServer#watchSASS` and `DevServer#run`
- [9da3694](../../commit/9da3694) [removed] the `watchDir` argument from `DevServer#watchSASS` and `DevServer#run`, opting into watching the CWD instead
- [60d2bb8](../../commit/60d2bb8) [added] bootswatch to the list of default import paths of `SASSCompiler`
- [90f5814](../../commit/90f5814) [added] `webpack.optimize.OccurrenceOrderPlugin` to the list of production plugins of `JSCompiler#fe`



v4.0.8 - Sat, 02 Jul 2016 08:51:27 GMT
--------------------------------------

- [c5b2145](../../commit/c5b2145) [fixed] updated dependencies



v4.0.7 - Tue, 21 Jun 2016 22:29:20 GMT
--------------------------------------

- [d572c23](../../commit/d572c23) [fixed] updated dependencies



v4.0.6 - Sat, 11 Jun 2016 22:38:26 GMT
--------------------------------------

- [4698324](../../commit/4698324) [added] `rest-spread-spacing` ESLint rule; `lodash/isFinite`, `lodash/toLower` and `lodash/includes` interface declarations



v4.0.5 - Thu, 09 Jun 2016 17:28:27 GMT
--------------------------------------

- [e5d7dc4](../../commit/e5d7dc4) [added] the `json` loader to `DevServer`, interface declaration for `lodash/debounce` and `React.PropTypes.number`



v4.0.4 - Wed, 08 Jun 2016 01:24:59 GMT
--------------------------------------

- [43e85ef](../../commit/43e85ef) [added] instanceOf PropType definition



v4.0.3 - Tue, 07 Jun 2016 13:58:07 GMT
--------------------------------------

- [c7b4ed0](../../commit/c7b4ed0) [fixed] enabled the `react/jsx-uses-react`, `react/jsx-no-target-blank` and `react/no-is-mounted` ESLint rules



v4.0.2 - Tue, 07 Jun 2016 12:31:39 GMT
--------------------------------------

- [757f44f](../../commit/757f44f) [fixed] npm package must include the `.eslintrc.yml` and the `.babelrc` files



v4.0.1 - Fri, 03 Jun 2016 22:02:47 GMT
--------------------------------------

- [5578892](../../commit/5578892) [fixed] compile in loose mode by default. Better [tree shaking](http://www.2ality.com/2015/12/webpack-tree-shaking.html) for webpack



v4.0.0 - Mon, 23 May 2016 18:33:38 GMT
--------------------------------------

- [d0e5692](../../commit/d0e5692) [changed] split the `Markup` class into 3 distinct modules - `jsx`, `markdown` and `highlight`. Added support for plain-object representations of React elements for easy serialization/unserialization.



v3.11.0 - Thu, 21 Apr 2016 19:08:25 GMT
---------------------------------------

- [4124ac4](../../commit/4124ac4) [changed] the `watch` function callback now accepts one argument - an object which describes what files were changed



v3.10.3 - Tue, 19 Apr 2016 19:18:21 GMT
---------------------------------------

- [f02346f](../../commit/f02346f) [fixed] removed the `marked` dependency



v3.10.2 - Tue, 19 Apr 2016 18:38:33 GMT
---------------------------------------

- [1249e1a](../../commit/1249e1a) [changed] replaced `marked` with `remarkable`



v3.10.1 - Tue, 19 Apr 2016 08:57:42 GMT
---------------------------------------

- [51e655d](../../commit/51e655d) [fixed] updated dependencies



v3.10.0 - Fri, 04 Mar 2016 10:33:19 GMT
---------------------------------------

- [4e525a9](../../commit/4e525a9) [removed] transformer support from the `Markup` class; updated the library definition file and the project dependencies



v3.9.0 - Tue, 01 Mar 2016 09:52:37 GMT
--------------------------------------

- [d864013](../../commit/d864013) [fixed] updated project dependencies
- [5f9b134](../../commit/5f9b134) [added] `Markup.highlightHTML` and `Markup.highlightJSX`



v3.8.4 - Mon, 22 Feb 2016 16:47:28 GMT
--------------------------------------

- [927f2d8](../../commit/927f2d8) [fixed] made webpack ignore the "fs" module; `Markup.flatten` removes falsy values



v3.8.3 - Sat, 20 Feb 2016 17:59:15 GMT
--------------------------------------

- [15b6f67](../../commit/15b6f67) [fixed] updated `eslint-plugin-react` dependency



v3.8.2 - Wed, 17 Feb 2016 09:08:15 GMT
--------------------------------------

- [c7d16ba](../../commit/c7d16ba) [fixed] updated `babel-eslint` and `lodash`



v3.8.1 - Tue, 16 Feb 2016 11:38:36 GMT
--------------------------------------

- [132ed72](../../commit/132ed72) [fixed] updated ESLint to v2.1.0



v3.8.0 - Sun, 14 Feb 2016 16:54:52 GMT
--------------------------------------

- [bc1e3f3](../../commit/bc1e3f3) [changed] updated ESLint to v2; removed eslint-config-airbnb; better and faster linting for javascript



v3.7.1 - Sun, 14 Feb 2016 00:06:38 GMT
--------------------------------------

- [18f7807](../../commit/18f7807) [fixed] made travis only watch the master branch; removed a duplicate eslint rule



v3.7.0 - Thu, 11 Feb 2016 20:01:16 GMT
--------------------------------------

- [c398d90](../../commit/c398d90) [added] `private Markup.markdownToUnwrappedHTML` - If a simple single line string is passed to the Markdown parser it thinks that it is a paragraph (it sort of technically is) and unnecessarily wraps it into `<p></p>`, which most often is not the desired behavior. This function fixes that.



v3.6.1 - Wed, 10 Feb 2016 21:57:35 GMT
--------------------------------------

- [50ac89a](../../commit/50ac89a) [fixed] `Markup` - trim the input and output where necessary
- [9ce8f3e](../../commit/9ce8f3e) [fixed] minor documentation updates; updates to the lodash interface file
- [f9346b1](../../commit/f9346b1) [fixed] updated dependencies



v3.6.0 - Thu, 04 Feb 2016 22:54:55 GMT
--------------------------------------

- [4a044cf](../../commit/4a044cf) [added] the `Markup.flatten` method
- [02c9096](../../commit/02c9096) [fixed] the interface declaration for `Markup` to make the input value for `htmlToJSX`, `markdownToHTML` and `markdownToJSX` optional



v3.5.3 - Thu, 04 Feb 2016 16:11:25 GMT
--------------------------------------

- [1dbe099](../../commit/1dbe099) [fixed] handle empty input in the `Markup` class; updated dependencies



v3.5.2 - Mon, 01 Feb 2016 12:52:50 GMT
--------------------------------------

- [47cbb2d](../../commit/47cbb2d) [fixed] updated cheerio dependeny to 0.20.0



v3.5.1 - Mon, 01 Feb 2016 09:56:53 GMT
--------------------------------------

- [2071e3a](../../commit/2071e3a) [fixed] Markup class definition in the webcompiler.js interface file



v3.5.0 - Sat, 30 Jan 2016 23:30:18 GMT
--------------------------------------

- [f42ab3d](../../commit/f42ab3d) [added] the `Markup` class, which converts Mardown to HTML and HTML to React components that can be used in JSX expressions



v3.4.2 - Wed, 27 Jan 2016 20:05:10 GMT
--------------------------------------

- [9a3b6e5](../../commit/9a3b6e5) [fixed] merge the Babel options manually instead of using the OptionManager because webpack can only pass primitive values as query parameters



v3.4.1 - Tue, 26 Jan 2016 23:14:40 GMT
--------------------------------------

- [cf43b9f](../../commit/cf43b9f) [fixed] webpack warnings are purely for informational purposes and do not abort the compilation



v3.4.0 - Tue, 26 Jan 2016 14:48:39 GMT
--------------------------------------

- [1d78498](../../commit/1d78498) [changed] removed a number of unnecessary dependencies; improved performance; updated dependencies; added more extensive linting rules for the use of the LoDash library
- [08969d1](../../commit/08969d1) [removed] support for CSS Modules. Though, certainly a good idea, the implementation is based solely on hacks, which I just do not feel comfortable having on the project. Also, switched to using the Babel OptionManager, instead of loading the configuration file manually.



v3.3.1 - Wed, 20 Jan 2016 13:18:18 GMT
--------------------------------------

- [2ab1cb1](../../commit/2ab1cb1) [fixed] updated the library interface file



v3.3.0 - Wed, 20 Jan 2016 12:57:51 GMT
--------------------------------------

- [440fc4e](../../commit/440fc4e) [added] a `compress` argument to `Compiler`, `JSCompiler`, `SASSCompiler`, `JS` and `SASS`
- [3a4331f](../../commit/3a4331f) [changed] the option of the ESLint rule dot-location from "object" to "property"
- [d7ac6fc](../../commit/d7ac6fc) [fixed] updated dependencies



v3.2.3 - Thu, 14 Jan 2016 22:13:56 GMT
--------------------------------------

- [11ff8f4](../../commit/11ff8f4) [added] a json-loader to `JSCompiler#fe`
- [d7be232](../../commit/d7be232) [fixed] updated dependencies



v3.2.2 - Wed, 13 Jan 2016 09:54:49 GMT
--------------------------------------

- [2af4164](../../commit/2af4164) [fixed] do not permanently override process.env.NODE_ENV



v3.2.1 - Mon, 11 Jan 2016 20:12:05 GMT
--------------------------------------

- [0dce231](../../commit/0dce231) [added] support for the server-side usage of the SCSS Modules
- [10f9884](../../commit/10f9884) [fixed] the `.scss` loader for webpack



v3.2.0 - Sat, 09 Jan 2016 19:30:41 GMT
--------------------------------------

- [52fba51](../../commit/52fba51) [added] support for importing `.scss` files as JavaScript modules to JSCompiler#fe



v3.1.0 - Fri, 08 Jan 2016 17:53:24 GMT
--------------------------------------

- [fda2228](../../commit/fda2228) [removed] the one-var ESLint rule
- [bff6a80](../../commit/bff6a80) [changed] JSCompiler#be now does not ignore non-JavaScript files, but simply copies them over
- [4cc3c3c](../../commit/4cc3c3c) [added] the mkdir function to Compiler
- [18ba82f](../../commit/18ba82f) [removed] an optimization that could result in errors for negligible gains
- [3b9ec58](../../commit/3b9ec58) [removed] an unnecessary test case from JSCompiler.spec
- [423522a](../../commit/423522a) [fixed] fixed minor spacing issue in jsdocPlugin
- [607ff33](../../commit/607ff33) [fixed] minor. updated docs
- [0ec2f02](../../commit/0ec2f02) [fixed] updated eslint-config-airbnb



v3.0.5 - Thu, 07 Jan 2016 23:14:25 GMT
--------------------------------------

- [217aa9d](../../commit/217aa9d) [removed] webpack deftool eval-source-map as a redundant optimisation in development mode, which actually made development harder
- [9bc19e2](../../commit/9bc19e2) [removed] babel-plugin-transform-remove-console
- [f7b8672](../../commit/f7b8672) [fixed] updated dependencies



v3.0.4 - Thu, 31 Dec 2015 01:15:12 GMT
--------------------------------------

- [4299688](../../commit/4299688) [removed] redundant Number conversion in `watch`
- [6da6e97](../../commit/6da6e97) [changed] the markdown JSDoc plugin is now included by default; added a broader description of the default plugin to the Documentation class
- [111046e](../../commit/111046e) [removed] obsolete "babel" package dependency



v3.0.3 - Wed, 30 Dec 2015 16:49:16 GMT
--------------------------------------

- [b174e99](../../commit/b174e99) [fixed] read the babel config options from under the "env" key
- [20cc69e](../../commit/20cc69e) [fixed] updated autoprefixer



v3.0.2 - Tue, 29 Dec 2015 10:10:46 GMT
--------------------------------------

- [cfc0d4a](../../commit/cfc0d4a) [fixed] added a codeclimate config



v3.0.1 - Mon, 28 Dec 2015 17:43:13 GMT
--------------------------------------

- [44908e7](../../commit/44908e7) [fixed] added back the coveralls dev dependency



v3.0.0 - Mon, 28 Dec 2015 17:15:00 GMT
--------------------------------------

- [4d4c980](../../commit/4d4c980) [changed] everything :) There were too many interconnected changes in this release for any kind of meaningful changelog. Just visit the all new API docs to get started!
- [7daa43f](../../commit/7daa43f) [added] documentation generation as a separate script
- [5f1f1f3](../../commit/5f1f1f3) [fixed] documentation
- [5097059](../../commit/5097059) [changed] updated flow ignore list and created interface files for all of the project dependencies
- [bcda000](../../commit/bcda000) [fixed] updated to ESLint v1.8.0
- [fd40706](../../commit/fd40706) [fixed] removed peerDependencies and added a requirement for the NodeJS version (>=4.1.1) as well as NPM (>=3.0.0)
- [6acff11](../../commit/6acff11) [fixed] travis caching enabled
- [22770c4](../../commit/22770c4) [removed] specific c++ compier version dependency from the travis config



v2.0.10 - Thu, 29 Oct 2015 23:00:47 GMT
---------------------------------------

- [79e984b](../../commit/79e984b) [fixed] updated the c++ compiler in travis



v2.0.9 - Thu, 29 Oct 2015 22:56:59 GMT
--------------------------------------

- [eaa06da](../../commit/eaa06da) [fixed] updated the c++ compiler in travis



v2.0.8 - Thu, 29 Oct 2015 22:23:47 GMT
--------------------------------------

- [0f30afe](../../commit/0f30afe) [fixed] updated dependencies
- [a6414b4](../../commit/a6414b4) [changed] switched from Slack to Discord
- [129b423](../../commit/129b423) [fixed] webpack noParse in jsWebCompile for any file a path for which contains the word "browser"



v2.0.7 - Tue, 27 Oct 2015 12:52:49 GMT
--------------------------------------

- [86f48d9](../../commit/86f48d9) [changed] API docs theme



v2.0.6 - Mon, 26 Oct 2015 15:41:34 GMT
--------------------------------------

- [e30aed3](../../commit/e30aed3) [fixed] updated dependencies



v2.0.5 - Wed, 14 Oct 2015 15:49:07 GMT
--------------------------------------

- [9d09fd1](../../commit/9d09fd1) [fixed] updated readme



v2.0.4 - Fri, 09 Oct 2015 22:44:03 GMT
--------------------------------------

- [e463cd8](../../commit/e463cd8) [fixed] updated README



v2.0.3 - Fri, 09 Oct 2015 22:37:20 GMT
--------------------------------------

- [64e683d](../../commit/64e683d) [changed] README.docs.md -> doc_readme.md



v2.0.2 - Fri, 09 Oct 2015 21:47:28 GMT
--------------------------------------

- [43a8c85](../../commit/43a8c85) [fixed] force push the correct docs folder :) [ci skip]



v2.0.1 - Fri, 09 Oct 2015 21:45:10 GMT
--------------------------------------

- [f5f46aa](../../commit/f5f46aa) [fixed] force push the docs [ci skip]



v2.0.0 - Fri, 09 Oct 2015 21:37:12 GMT
--------------------------------------

- [15d1079](../../commit/15d1079) [added] postpublish hook that automatically pushes the generated docs
- [9bee23b](../../commit/9bee23b) [added] updated readme to include a mention about the Watchman requirement
- [84fa46e](../../commit/84fa46e) [fixed] jsWebCompile improved performance in development mode, advanced optimizations in production
- [9d0ab0b](../../commit/9d0ab0b) [added] a watch method based on Facebook Watchman as a replacement for the soon to be deprecated simple-recursive-watch
- [9130266](../../commit/9130266) [added] gitignore rule for .idea



v1.5.4 - Wed, 07 Oct 2015 09:09:19 GMT
--------------------------------------

- [d4a8b1b](../../commit/d4a8b1b) [fixed] disabled the react/sort-comp rule



v1.5.3 - Sun, 04 Oct 2015 17:58:34 GMT
--------------------------------------

- [566d2db](../../commit/566d2db) [fixed] yaml indentation issue



v1.5.2 - Sun, 04 Oct 2015 17:41:38 GMT
--------------------------------------

- [0c90d71](../../commit/0c90d71) [fixed] updated eslint to v1.6.0 and enabled the no-negated-condition rule



v1.5.1 - Fri, 02 Oct 2015 01:02:36 GMT
--------------------------------------

- [829dee3](../../commit/829dee3) [fixed] minor linting problems



v1.5.0 - Tue, 29 Sep 2015 21:41:16 GMT
--------------------------------------

- [d4ad959](../../commit/d4ad959) [changed] inherit eslint-config-airbnb with some refined best practices
- [6a0a6eb](../../commit/6a0a6eb) [fixed] updated 3rd party dependencies
- [d6a7c07](../../commit/d6a7c07) [fixed] updated to Flow v0.16.0
- [1ecb8ab](../../commit/1ecb8ab) [fixed] jsdoc for optinal arguments contains the default value
- [111d8a9](../../commit/111d8a9) [fixed] updated to NodeJS v4.1.1
- [235dd29](../../commit/235dd29) [added] a port number argument into the DevServer constructor
- [0715999](../../commit/0715999) [fixed] only execute tests after a successful build
- [a25ba24](../../commit/a25ba24) [fixed] NativeProcess does not crash when inheriting stdio
- [a4b43a3](../../commit/a4b43a3) [fixed] do not include a "generated on" timestamp in the footer of the documentation files
- [735d9fa](../../commit/735d9fa) [fixed] made flow ignore all folders except for "lib" and "node_modules"



### v1.4.1

* moved away from the now deprecated "autoprefixer-core" to "autoprefixer"

### v1.4.0

* added a development server component designed specifically for very rapid and comfortable application development,
  built on top of the webpack development server + optionally, react hot loader
* updated ESLint to v1.2.0

### v1.3.2

* increased the maximum allowed number of arguments a JavaScript function can have to 10

### v1.3.0

* upgraded to ESLint 1.0!
* much improved default JavaScript linter rules

### v1.2.2

* updated to the latest babel-eslint

### v1.2.0

* classes JS and SASS - made "feDev" faster by removing all the validations, the point of this method is to provide as
  fast as possible recompilations for rapid development
* class SASS - "feDev" also adds the browser vendor prefixes, which degrades the compilation speed slightly, but allows
  the developer to immediately see the end result without worrying about browser incompatibilities

### v1.1.1

* class JS - faster source map generation on incremental rebuilds in development mode

### v1.1.0

* classes JS and SASS - renamed method "fe" to "feProd"
* classes JS and SASS - introduced a new method "feDev", much faster, but not optimized for production

### v1.0.2

* added a rule to .flowconfig to ignore "spec" directories of the vendor modules

### v1.0.0

* added sane default rules for the SASS linter
* added a rule for cyclomatic complexity checks of the JavaScript code
* removed a requirement for naming all functions
* exposed all of the internal APIs for easier composition and reuse
* added full test coverage

### v0.3.5

* JavaScript for Node now preserves all comments, excluding the flow pragma

### v0.3.2

* JavaScript for Node now preserves all comments, including JSDoc's, perfect for automatic API documentation generation
* Updated **".flowconfig"** (see README)
* `NativeProcess#run` now accepts an additional config object

### v0.3.0

* Introduced much stricter JavaScript linting rules
* Added automatic API documentation generation
