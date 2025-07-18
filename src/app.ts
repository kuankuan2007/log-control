import { Logger } from './logger.js';
import { Recorder } from './recorder.js';
import { ApplicationOptions, LEVEL, LoggerPath } from './types.js';

export class Application {
  readonly name: string;
  protected recorders: Recorder[] = [];
  protected readonly logger: Logger;
  readonly all: Logger['all'];
  readonly trace: Logger['trace'];
  readonly debug: Logger['debug'];
  readonly info: Logger['info'];
  readonly warn: Logger['warn'];
  readonly error: Logger['error'];
  readonly fatal: Logger['fatal'];
  readonly createLogger: Logger['createLogger'];

  constructor(option: ApplicationOptions) {
    this.name = option.name;
    this.logger = new Logger([], this);
    this.all = this.logger.all.bind(this.logger);
    this.trace = this.logger.trace.bind(this.logger);
    this.debug = this.logger.debug.bind(this.logger);
    this.info = this.logger.info.bind(this.logger);
    this.warn = this.logger.warn.bind(this.logger);
    this.error = this.logger.error.bind(this.logger);
    this.fatal = this.logger.fatal.bind(this.logger);
    this.createLogger = this.logger.createLogger.bind(this.logger);
  }
  log(message: any, level: LEVEL, path: LoggerPath) {
    const _path = path.join('.') || '_root';
    for (const i of this.recorders) {
      if (i.startLevel <= level) i.log(level, _path, message, this);
    }
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
