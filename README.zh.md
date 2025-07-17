# @kuankuan/log-control

一个更详细的 Node.js 日志库，提供灵活的日志级别、可定制的格式化器，以及多种多级日志记录器类型。

## 功能

- 多种日志级别：ALL、TRACE、DEBUG、INFO、WARN、ERROR、FATAL、OFF
- 可自定义日志格式和日期格式
- 控制台、文件、可写流和事件触发器记录器
- 易于集成到你的应用程序
- 支持 TypeScript
- 一个记录器可以拥有子记录器，可用于过滤日志记录
- 使用 [string-format](<(https://npmjs.com/package/string-format)>) 格式化日志消息

## 安装

```sh
npm install @kuankuan/log-control
```

## 用法

```ts
import logControl from '@kuankuan/log-control';

const app = new logControl.Application({ name: 'my-app' });

// 添加控制台记录器
app.addRecorder(new logControl.ConsoleRecorder({ startLevel: logControl.Level.All }));

// 添加文件记录器
app.addRecorder(new logControl.FileRecorder('./app.log'));

// 创建带有自定义路径的 logger
const logger1 = app.createLogger('module');
const logger2 = logger1.createLogger('submodule1');
const logger3 = logger2.createLogger('request');

// [DEBUG] [my-app] [_root] 这是一条调试信息
app.debug('这是一条调试信息');

// [INFO] [my-app] [module] 这是一条信息
logger1.info('这是一条信息');

// [WARN] [my-app] [module.submodule1] 这是一条警告信息
logger2.warn('这是一条警告信息');

// [ERROR] [my-app] [module.submodule1.request] 这是一条错误信息
logger3.error('这是一条错误信息');
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

### 记录器

- `ConsoleRecorder`
- `FileRecorder`
- `WriteableRecorder`
- `NullRecorder`
- `EventEmitterRecorder`

## 许可证

本项目采用 Mozilla Public License 2.0 许可。详情请参见 [LICENSE](LICENSE)。
