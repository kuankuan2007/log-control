export interface ApplicationOptions {
  name: string;
}

const All = 0;
const Trace = 1;
const Debug = 2;
const Info = 3;
const Warn = 4;
const Error = 5;
const Fatal = 6;
const Off = 7;

export type ALL = typeof All;
export type TRACE = typeof Trace;
export type DEBUG = typeof Debug;
export type INFO = typeof Info;
export type WARN = typeof Warn;
export type ERROR = typeof Error;
export type FATAL = typeof Fatal;
export type OFF = typeof Off;

export const Level = {
  All,
  Trace,
  Debug,
  Info,
  Warn,
  Error,
  Fatal,
  Off,
} as const;
export const levelNames = [
  'ALL',
  'TRACE',
  'DEBUG',
  'INFO',
  'WARN',
  'ERROR',
  'FATAL',
  'OFF',
] as const;

export type LEVEL = ALL | TRACE | DEBUG | INFO | WARN | ERROR | FATAL | OFF;

export type LoggerPath = string[];

export interface FormatterArgs {
  level: string;
  levelData: LEVEL;
  path: string;
  message: string;
  time: string;
  application: string;
}
export type DateStringFormatterArgs = Readonly<{
  year: string;
  month: string;
  date: string;
  hour: string;
  minute: string;
  second: string;
  millisecond: string;

  yearShort: string;
  monthLongName: string;
  monthName: string;
  day: string;
  dayName: string;
  dayLongName: string;

  hour12: string;
  amOrPm: string;

  time: string;
  timeInSeconds: string;

  timeZone: string;
  timeZoneName: string;

  utcYear: string;
  utcMonth: string;
  utcDate: string;
  utcHour: string;

  utcYearShort: string;
  utcMonthLongName: string;
  utcMonthName: string;
  utcDay: string;
  utcDayName: string;
  utcDayLongName: string;

  utcHour12: string;
  utcAmOrPm: string;
}>;
export function getDateFormatterArgs(date: Date): DateStringFormatterArgs {
  return {
    get year() {
      return date.getFullYear().toString();
    },
    get month() {
      return (date.getMonth() + 1).toString();
    },
    get date() {
      return date.getDate().toString();
    },
    get hour() {
      return date.getHours().toString();
    },
    get minute() {
      return date.getMinutes().toString();
    },
    get second() {
      return date.getSeconds().toString();
    },
    get millisecond() {
      return date.getMilliseconds().toString();
    },
    get yearShort() {
      return (date.getFullYear() % 100).toString();
    },
    get monthLongName() {
      return date.toLocaleString('en-US', { month: 'long' });
    },
    get monthName() {
      return date.toLocaleString('en-US', { month: 'short' });
    },
    get day() {
      return date.getDay().toString();
    },
    get dayName() {
      return date.toLocaleString('en-US', { weekday: 'long' });
    },
    get dayLongName() {
      return date.toLocaleString('en-US', { weekday: 'short' });
    },
    get hour12() {
      return (date.getHours() % 12 || 12).toString();
    },
    get amOrPm() {
      return date.getHours() < 12 ? 'AM' : 'PM';
    },
    get time() {
      return date.getTime().toString();
    },
    get timeInSeconds() {
      return (date.getTime() / 1000).toString();
    },
    get timeZone() {
      const _offeset = date.getTimezoneOffset();
      return (_offeset ? _offeset / -60 : 0).toString();
    },
    get timeZoneName() {
      const _offeset = date.getTimezoneOffset();

      const zone = _offeset ? _offeset / -60 : 0;

      return `UTC${zone > 0 ? '+' : ''}${zone}`;
    },
    get utcYear() {
      return (date.getUTCFullYear() % 100).toString();
    },
    get utcMonth() {
      return (date.getUTCMonth() + 1).toString();
    },
    get utcDate() {
      return date.getUTCDate().toString();
    },
    get utcHour() {
      return date.getUTCHours().toString();
    },
    get utcYearShort() {
      return (date.getUTCFullYear() % 100).toString();
    },
    get utcMonthLongName() {
      return date.toLocaleString('en-US', { month: 'long' });
    },
    get utcMonthName() {
      return date.toLocaleString('en-US', { month: 'short' });
    },
    get utcDay() {
      return date.getUTCDay().toString();
    },
    get utcDayName() {
      return date.toLocaleString('en-US', { weekday: 'long' });
    },
    get utcDayLongName() {
      return date.toLocaleString('en-US', { weekday: 'short' });
    },
    get utcHour12() {
      return (date.getUTCHours() % 12 || 12).toString();
    },
    get utcAmOrPm() {
      return date.getUTCHours() < 12 ? 'AM' : 'PM';
    },
  };
}
