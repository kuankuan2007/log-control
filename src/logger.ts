import Application from './app.js';
import { LoggerPath, Level, LEVEL } from './types.js';

export default class Logger {
  private readonly path: LoggerPath;
  private readonly application: Application;
  constructor(path: LoggerPath, application: Application) {
    this.path = path;
    this.application = application;
  }

  log(message: any, level: LEVEL) {
    this.application.log(message, level, this.path);
  }

  createLogger(name: string) {
    return new Logger([...this.path, name], this.application);
  }
  all(message: any) {
    this.log(message, Level.All);
  }
  trace(message: any) {
    this.log(message, Level.Trace);
  }
  debug(message: any) {
    this.log(message, Level.Debug);
  }
  info(message: any) {
    this.log(message, Level.Info);
  }
  warn(message: any) {
    this.log(message, Level.Warn);
  }
  error(message: any) {
    this.log(message, Level.Error);
  }
  fatal(message: any) {
    this.log(message, Level.Fatal);
  }
}
