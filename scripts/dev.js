/**
 * Локальная разработка одной командой: поднимает API (NestJS + локальная
 * файловая БД sqljs, автосид при первом запуске) и dev-сервер Vite.
 * CLI-аргументы (--port, --host и т.п.) пробрасываются в Vite.
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const serverDir = path.join(root, 'server');
const dbFile = path.join(serverDir, 'buynet.dev.db');

function run(cmd, args, cwd, env = {}) {
  return spawn(cmd, args, {
    cwd,
    shell: true,
    stdio: 'inherit',
    env: { ...process.env, ...env },
  });
}

async function main() {
  // Первый запуск: наполняем локальную БД демо-данными
  if (!fs.existsSync(dbFile)) {
    console.log('[dev] Локальной БД нет — заполняю демо-данными…');
    const code = await new Promise((resolve) => {
      run('node', ['dist/seed/seed.js'], serverDir, { DB_TYPE: 'sqljs' }).on('exit', resolve);
    });
    if (code !== 0) {
      console.error('[dev] Сидирование не удалось');
      process.exit(1);
    }
  }

  // API на :3000 (node напрямую — корректно завершается вместе с dev.js)
  const api = spawn(process.execPath, ['dist/main.js'], {
    cwd: serverDir,
    stdio: 'inherit',
    env: { ...process.env, DB_TYPE: 'sqljs', PORT: '3000' },
  });

  // Vite dev-сервер, аргументы командной строки (--port, --host …) — ему
  const viteBin = path.join(root, 'app', 'node_modules', 'vite', 'bin', 'vite.js');
  const web = spawn(process.execPath, [viteBin, ...process.argv.slice(2)], {
    cwd: path.join(root, 'app'),
    stdio: 'inherit',
    env: { ...process.env },
  });

  const shutdown = () => {
    api.kill();
    web.kill();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  api.on('exit', (code) => {
    console.log(`[dev] API завершился (${code})`);
    web.kill();
    process.exit(code ?? 0);
  });
  web.on('exit', (code) => {
    console.log(`[dev] Vite завершился (${code})`);
    api.kill();
    process.exit(code ?? 0);
  });
}

main().catch((err) => {
  console.error('[dev] Ошибка запуска:', err.message);
  process.exit(1);
});
