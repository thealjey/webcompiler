import {spawn} from 'child_process';

/**
 * Encapsulates a ChildProcess instance of a "task"
 */
export class NativeProcess {

  task: string;

  proc: any;

  constructor(task: string) {
    this.task = task;
  }

  /**
   * Run a callback if the process did not end with an error, optionally pass an array of arguments
   *
   * @param  {Function} callback
   * @param  {string[]} args
   */
  run(callback: Function, args: Array<string> = []) {
    if (this.proc) {
      this.proc.kill();
    }
    this.proc = spawn(this.task, args, {stdio: 'inherit'});
    this.proc.on('close', function (code) {
      if (!code) {
        callback();
      }
    });
  }

}
