import * as _app from './app.js';
import * as _logger from './logger.js';
import * as _types from './types.js';
import * as _recorder from './recorder.js';
export * from './app.js';
export * from './logger.js';
export * from './types.js';
export * from './recorder.js';

const logControl = {
  ..._app,
  ..._logger,
  ..._types,
  ..._recorder,
};

export default logControl;
