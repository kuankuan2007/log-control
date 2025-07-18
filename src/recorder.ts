import { Writable } from 'stream';
import { Application } from './app.js';
import { FormatterArgs, getDateFormatterArgs, Level, LEVEL, levelNames } from './types.js';
import stringFormat from 'string-format';
import fs from 'fs';

export type RecorderConstructorOptions = {
  formatter?: string | ((args: FormatterArgs) => string);
  dateFormatter?: string | ((date: Date) => string);
  stringify?: (data: any) => string;
  startLevel?: LEVEL;
};
export abstract class Recorder {
  startLevel: LEVEL;
  protected formatter: (args: FormatterArgs) => string;
  protected dateFormatter: (date: Date) => string;
  protected stringify: (data: any) => string;
  constructor({
    formatter = '[{time}] [{level}] [{path}] [{time}]: {message}',
    dateFormatter = '{year}-{month}-{date} {hour}:{minute}:{second}',
    stringify = (data: any) => data.toString(),
    startLevel = Level.Warn,
  }: RecorderConstructorOptions = {}) {
    this.startLevel = startLevel;
    this.formatter = (() => {
      if (typeof formatter === 'string') {
        return (args: FormatterArgs) => {
          return stringFormat(formatter, args);
        };
      }
      return formatter;
    })();
    this.dateFormatter = (() => {
      if (typeof dateFormatter === 'string') {
        return (date: Date) => {
          return stringFormat(dateFormatter, getDateFormatterArgs(date));
        };
      }
      return dateFormatter;
    })();
    this.stringify = stringify;
  }
  log(level: LEVEL, path: string, message: any, application: Application) {
    let msg = this.formatter({
      application: application.name,
      level: levelNames[level],
      levelData: level,
      message: this.stringify(message),
      path: path,
      time: this.dateFormatter(new Date()),
    });
    if (!msg.endsWith('\n')) msg += '\n';
    this.write(msg);
  }
  abstract write(msg: string): void;
  abstract close(): Promise<void> | void;
}
export class ConsoleRecorder extends Recorder {
  protected readonly showApplication: boolean;
  protected readonly styleConfig: Record<LEVEL, string>;
  protected readonly showTime: boolean;
  constructor({
    styleConfig = {
      [Level.All]: 'color: gray;',
      [Level.Trace]: 'color: gray;font-weight: bold;',
      [Level.Debug]: 'color: blue;',
      [Level.Info]: 'color:blue;font-weight: bold;',
      [Level.Warn]: 'color: orange;font-weight: bold;',
      [Level.Error]: 'color: red;font-weight: bold;',
      [Level.Fatal]: 'color: red;font-weight: bold;',
      [Level.Off]: 'color: red;font-weight: bold;',
    },
    startLevel = Level.Debug,
    showApplication = false,
    showTime = true,
  }: {
    styleConfig?: Record<LEVEL, string>;
    startLevel?: LEVEL;
    showApplication?: boolean;
    showTime?: boolean;
  } = {}) {
    super({ startLevel });
    this.showApplication = showApplication;
    this.styleConfig = styleConfig;
    this.showTime = showTime;
  }
  log(level: LEVEL, path: string, message: any, application: Application): void {
    const style = this.styleConfig[level];
    const argList = [
      `%c[${levelNames[level]}]`,
      style,
      ...(this.showTime ? [`[${this.dateFormatter(new Date())}]`] : []),
      ...(this.showApplication ? [] : [`[${application.name}]`]),
      ...[`[${path}]`],
      ...(typeof message !== 'string' ? [message] : [`${message}`]),
    ];
    switch (level) {
      case Level.All:
      case Level.Trace:
      case Level.Debug:
        console.debug(...argList);
        break;
      case Level.Info:
        console.info(...argList);
        break;
      case Level.Warn:
        console.warn(...argList);
        break;
      default:
        console.error(...argList);
    }
  }
  write() {}
  close() {}
}
export class WriteableRecorder extends Recorder {
  protected readonly writeable: Writable;
  constructor(writeable: Writable, option: RecorderConstructorOptions = {}) {
    if (writeable.writableEnded || writeable.closed) {
      throw new Error('The writeable is already ended.');
    }
    super(option);
    this.writeable = writeable;
  }
  close(): Promise<void> | void {
    const prm = Promise.withResolvers<void>();
    this.writeable.end(prm.resolve);
    return prm.promise;
  }
  write(msg: string): void {
    this.writeable.write(msg);
  }
}
export class NullRecorder extends Recorder {
  close() {}
  write() {}
}
export class FileRecorder extends WriteableRecorder {
  constructor(path: string, option: RecorderConstructorOptions = {}) {
    super(fs.createWriteStream(path), option);
  }
}
export class EventEmitterRecorder extends Recorder {
  protected listeners: ((info: {
    level: LEVEL;
    path: string;
    message: any;
    application: string;
  }) => void)[] = [];
  constructor() {
    super({ startLevel: Level.All });
  }
  log(level: LEVEL, path: string, message: any, application: Application): void {
    this.listeners.forEach((listener) => {
      listener({ level, path, message: message, application: application.name });
    });
  }
  addListener(
    listener: (info: { level: LEVEL; path: string; message: any; application: string }) => void
  ) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
  write() {}
  close() {}
}
