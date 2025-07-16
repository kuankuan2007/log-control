import {Application as App} from '../../dist/app.js';
import { ConsoleRecorder, FileRecorder } from '../../dist/recorder.js';

const app = new App({
  name: 'test',
});
app.addRecorder(new ConsoleRecorder({ startLevel: 0 }));
app.addRecorder(new FileRecorder('./test.log'));

const root = app.createLogger('root').createLogger('b');

root.warn('info');
app.warn('info');
