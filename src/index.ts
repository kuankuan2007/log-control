import { Writable } from 'node:stream';
import pc from 'picocolors';
export type LogLevel = (typeof Level)[LogLevelName];
export type LogLevelName = keyof typeof Level;
export const Level = {
  DEBUG: 0,
  INFO: 1,
  WARNING: 2,
  ERROR: 3,
} as const;
export const LevelSort = ['DEBUG', 'INFO', 'WARNING', 'ERROR'] as const;

export type StringifyCb = (
  data: LogData & {
    needColor: boolean;
  }
) => string;
export type LogData = {
  msg: string;
  level: LogLevel;
  time: Date;
  error?: Error;
  stack?: string;
};
export type Option = {
  name: string;
  stringify?: StringifyCb;
  startLogToScreenLevel?: LogLevel;
  disableDefaultLogToScreen?: boolean;
};
type DefaultOption<T extends object> = Required<{
  [key in keyof T]: T[key] extends Required<T>[key] ? never : T[key];
}>;

export function createLogger(opiton: Option) {
  const fullOpiton: Required<Option> = Object.assign(
    {
      startLogToScreenLevel: Level.WARNING,
      disableDefaultLogToScreen: false,
      stringify: function (data) {
        const colorMap = ['green', 'blue', 'yellow', 'red'] as const;
        return (data.needColor ? pc[colorMap[data.level]] : (a:string)=>a)(
          `[${LevelSort[data.level]}] [${data.time.toLocaleString()}]: ${data.msg}\n`
        );
      } as StringifyCb,
    } as DefaultOption<Option>,
    opiton
  );
  const eventListeners = {
    log: [] as ((log: LogData) => void)[],
  } as const;
  const target = {
    stringify: fullOpiton.stringify,
    log: function (level: LogLevel, msg: string, cause?: Error) {
      this.logList.push({
        msg,
        level,
        error: cause,
        time: new Date(),
        stack: (cause || new Error()).stack,
      });
      this.emitEvent('log', this.logList[this.logList.length - 1]);
    },
    [Symbol.toStringTag]: `Logger-${fullOpiton.name}`,
    logList: [] as LogData[],
    writeToScreen: function (datas: number | LogData | LogData[]) {
      this.write(process.stderr, datas, pc.isColorSupported);
    },
    write: function (
      writeStream: Writable,
      datas: number | LogData | (LogData | number)[],
      needColor: boolean = false
    ) {
      if (!Array.isArray(datas)) {
        datas = [datas];
      }
      const dataList = datas.filter((i) =>
        typeof i === 'number' ? this.logList[i] : i
      ) as LogData[];
      for (const i of dataList) {
        writeStream.write(
          this.stringify({
            ...i,
            needColor,
          })
        );
      }
    },
    addEventListener: function <T extends keyof typeof eventListeners>(
      event: T,
      listener: (typeof eventListeners)[T][number]
    ) {
      eventListeners[event].push(listener);
      return () => {
        eventListeners[event] = eventListeners[event].filter((x) => x !== listener);
      };
    },
    emitEvent: function <T extends keyof typeof eventListeners>(
      event: T,
      ...args: Parameters<(typeof eventListeners)[T][number]>
    ) {
      for (const i of eventListeners[event]) {
        i.apply(this, args);
      }
    },
    name: opiton.name,
    opiton:fullOpiton
  } as const;
  type LoggerCaller = typeof target.log;
  const logger = new Proxy<typeof target>(Object.assign(Object.create(null), target), {
    get(target, p) {
      if (p in target) {
        const value = target[p as keyof typeof target];
        if (typeof value === 'function') return value.bind(target);
        return value;
      }
      if (LevelSort.includes(p as LogLevelName)) {
        return (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...args: LoggerCaller extends (level: any, ...args: infer args) => any ? args : never
        ) => {
          return target.log(Level[p as LogLevelName], ...args);
        };
      }
      return void 0;
    },
  }) as unknown as {
    [key in keyof typeof target]: (typeof target)[key];
  } & {
    [key in LogLevelName]: (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...args: LoggerCaller extends (level: any, ...args: infer args) => any ? args : never
    ) => ReturnType<LoggerCaller>;
  };
  logger.addEventListener('log', (log) => {
    if (!opiton.disableDefaultLogToScreen && log.level >= fullOpiton.startLogToScreenLevel) {
      logger.writeToScreen(log);
    }
  });
  return logger;
}
