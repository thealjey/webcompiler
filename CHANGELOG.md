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
