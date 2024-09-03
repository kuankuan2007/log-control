import { Writable } from 'stream';
import Application from './app.js';
import { FormatterArgs, getDateFormatterArgs, Level, LEVEL, levelNames } from './types.js';
import stringFormat from 'string-format';

export type RecorderConstructorOptions = {
  formatter?: string | (() => string);
  dateFormatter?: string | ((date: Date) => string);
  stringify?: (data: any) => string;
  startLevel?: LEVEL;
};
export abstract class Recorder {
  startLevel: LEVEL;
  private formatter: (args: FormatterArgs) => string;
  private dateFormatter: (date: Date) => string;
  private stringify: (data: any) => string;
  constructor(options: RecorderConstructorOptions) {
    this.startLevel = options.startLevel || Level.Warn;
    this.formatter = (() => {
      const _formatter = options.formatter || '[{time}] [{level}] [{path}]: {message}';
      if (typeof _formatter === 'string') {
        return (args: FormatterArgs) => {
          return stringFormat(_formatter, args);
        };
      }
      return _formatter;
    })();
    this.dateFormatter = (() => {
      const _dateFormatter =
        options.dateFormatter || '{fullYear}-{month}-{date} {hour}:{minute}:{second}';
      if (typeof _dateFormatter === 'string') {
        return (date: Date) => {
          return stringFormat(_dateFormatter, getDateFormatterArgs(date));
        };
      }
      return _dateFormatter;
    })();
    this.stringify = options.stringify || ((data: any) => data.toString());
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
  private readonly option: {
    styleConfig: Record<LEVEL, string>;
    logExample: boolean;
    logLevelBefore: boolean;
    showApplication: boolean;
  };
  constructor(option: {
    styleConfig?: Record<LEVEL, string>;
    startLevel?: LEVEL;
    logExample?: boolean;
    logLevelBefore?: boolean;
    showApplication?: boolean;
  }) {
    super({ startLevel: option.startLevel || Level.Debug });
    this.option = {
      logExample: true,
      logLevelBefore: false,
      showApplication: false,
      ...option,
      styleConfig: {
        [Level.All]: 'color: gray;',
        [Level.Trace]: 'color: gray;font-weight: bold;',
        [Level.Debug]: 'color: blue;',
        [Level.Info]: 'color:blue;font-weight: bold;',
        [Level.Warn]: 'color: orange;font-weight: bold;',
        [Level.Error]: 'color: red;font-weight: bold;',
        [Level.Fatal]: 'color: red;font-weight: bold;',
        [Level.Off]: 'color: red;font-weight: bold;',
        ...option.styleConfig,
      },
    };
  }
  log(level: LEVEL, path: string, message: any, application: Application): void {
    const style = this.option.styleConfig[level];
    const argList = [
      ...(this.option.logLevelBefore ? [] : [`%c[${levelNames[level]}]`, style]),
      ...(this.option.showApplication ? [] : [`%c[${application}]`, style]),
      ...[`%c${path}`, style],
      ...(typeof message !== 'string' ? [message] : [`%c${message}`, style]),
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
  private readonly writeable: Writable;
  constructor(writeable: Writable, option: RecorderConstructorOptions) {
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
