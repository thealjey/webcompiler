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
