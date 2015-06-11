'use strict';

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

exports.__esModule = true;

var _child_process = require('child_process');

var NativeProcess = (function () {
  function NativeProcess(task) {
    _classCallCheck(this, NativeProcess);

    this.task = task;
  }

  NativeProcess.prototype.run = function run(callback) {
    var args = arguments[1] === undefined ? [] : arguments[1];

    if (this.proc) {
      this.proc.kill();
    }
    this.proc = (0, _child_process.spawn)(this.task, args, { stdio: 'inherit' });
    this.proc.on('close', function (code) {
      if (!code) {
        callback();
      }
    });
  };

  return NativeProcess;
})();

exports.NativeProcess = NativeProcess;