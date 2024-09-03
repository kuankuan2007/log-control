import childProcess from 'child_process';
import fs from 'fs';
const dirs = ['dist', 'types'];
for (const dir of dirs) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true });
  }
}
childProcess.execSync('npm run build');
