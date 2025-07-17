# @kuankuan/log-control

A more detailed logging library for Node.js, which offers flexible logging levels, customizable formatters, and multiple, multi-level logger types.

## Features

- Multiple log levels: ALL, TRACE, DEBUG, INFO, WARN, ERROR, FATAL, OFF
- Customizable log format and date format
- Console, file, writable stream, and event emitter recorders
- Easy integration with your application
- TypeScript support
- A recorder can have sub-recorders, which can be used to filter log records
- Use [string-format]((https://npmjs.com/package/string-format)) to format log messages

## Installation

```sh
npm install @kuankuan/log-control
```

## Usage

```ts
import logControl from '@kuankuan/log-control';

const app = new logControl.Application({ name: 'my-app' });

// Add console recorder
app.addRecorder(new logControl.ConsoleRecorder({ startLevel: logControl.Level.All }));

// Add file recorder
app.addRecorder(new logControl.FileRecorder('./app.log'));

// Create a logger with a custom path
const logger1 = app.createLogger('module');
const logger2 = logger1.createLogger('submodule1');
const logger3 = logger2.createLogger('request');

// [DEBUG] [my-app] [_root] This is a debug message
app.debug('This is a debug message');

// [INFO] [my-app] [module] This is an info message
logger1.info('This is an info message');

// [WARN] [my-app] [module.submodule1] This is a warning message
logger2.warn('This is a warning message');

// [ERROR] [my-app] [module.submodule1.request] This is an error message
logger3.error('This is an error message');
```

## API

### Application

- `new Application(options: { name: string })`
- `.addRecorder(recorder: Recorder): () => void`
- `.createLogger(name: string): Logger`
- `.all(message: any)`
- `.trace(message: any)`
- `.debug(message: any)`
- `.info(message: any)`
- `.warn(message: any)`
- `.error(message: any)`
- `.fatal(message: any)`
- `.close(): Promise<void[]>`

### Recorders

- `ConsoleRecorder`
- `FileRecorder`
- `WriteableRecorder`
- `NullRecorder`
- `EventEmitterRecorder`

## License

This project is licensed under the Mozilla Public License 2.0. See [LICENSE](LICENSE) for details.
