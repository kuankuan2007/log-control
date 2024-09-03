import Logger from './logger.js';
import { Recorder } from './recorder.js';
import { ApplicationOptions, LEVEL, LoggerPath } from './types.js';

export default class Application {
  readonly name: string;
  private recorders: Recorder[] = [];
  private readonly logger: Logger;
  constructor(option: ApplicationOptions) {
    this.name = option.name;
    this.logger = new Logger([], this);
  }

  log(message: any, level: LEVEL, path: LoggerPath) {
    const _path = path.join('.');
    for (const i of this.recorders) {
      if (i.startLevel >= level) i.log(level, _path, message, this);
    }
  }
  createLogger(namespace: string) {
    return this.logger.createLogger(namespace);
  }
  addRecorder(recorder: Recorder) {
    this.recorders.push(recorder);
    return () => {
      this.recorders = this.recorders.filter((item) => item !== recorder);
    };
  }
  close() {
    return Promise.all(this.recorders.map((item) => item.close()));
  }
}
