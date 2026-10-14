const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const BACKUP_DIR = process.env.BACKUP_DIR || path.resolve(__dirname, '../../../uploads/backups');
const DB_CONTAINER = process.env.DB_CONTAINER_NAME || 'mariadb-local';

function ensureDir() {
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function parseDbUrl() {
  const rawUrl = process.env.DATABASE_URL || '';
  const urlStr = rawUrl.trim().replace(/^["']|["']$/g, '');
  if (!urlStr) throw new Error('DATABASE_URL tidak diset');
  try {
    const parsed = new URL(urlStr);
    const user = decodeURIComponent(parsed.username);
    const password = decodeURIComponent(parsed.password);
    const host = parsed.hostname || 'localhost';
    const port = parsed.port || '3306';
    const db = parsed.pathname.replace(/^\//, '').split('?')[0];
    if (!db) throw new Error('Nama database tidak ditemukan di DATABASE_URL');
    return { user, password, host, port, db };
  } catch (err) {
    const m = urlStr.match(/mysql:\/\/([^:]+):([^@]+)@([^:/]+)(?::(\d+))?\/([^?]+)/);
    if (!m) throw new Error('DATABASE_URL tidak valid: ' + err.message);
    return {
      user: decodeURIComponent(m[1]),
      password: decodeURIComponent(m[2]),
      host: m[3] || 'localhost',
      port: m[4] || '3306',
      db: m[5].split('?')[0],
    };
  }
}

function sanitizeName(name) {
  if (!name || typeof name !== 'string') throw new Error('Nama file tidak valid');
  const clean = path.basename(name).trim();
  if (!clean.endsWith('.sql') || !/^[\w\s().-]+\.sql$/i.test(clean) || clean.includes('..')) {
    throw new Error('Nama file tidak valid (hanya file .sql)');
  }
  return clean;
}

const isWindows = process.platform === 'win32';

function fileExists(p) {
  try {
    return !!p && fs.existsSync(p) && fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

function findInWindowsPaths(binNames) {
  const drives = ['C:', 'D:'];
  const baseDirs = [
    'Program Files\\MariaDB',
    'Program Files (x86)\\MariaDB',
    'Program Files\\MySQL',
    'Program Files (x86)\\MySQL',
    'xampp\\mysql\\bin',
    'laragon\\bin\\mysql',
  ];

  for (const drive of drives) {
    for (const base of baseDirs) {
      const fullBase = `${drive}\\${base}`;
      try {
        if (!fs.existsSync(fullBase)) continue;
        for (const name of binNames) {
          const directFile = path.join(fullBase, name.endsWith('.exe') ? name : `${name}.exe`);
          if (fileExists(directFile)) return directFile;
        }

        const entries = fs.readdirSync(fullBase, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const subBinDir = path.join(fullBase, entry.name, 'bin');
            if (fs.existsSync(subBinDir)) {
              for (const name of binNames) {
                const targetFile = path.join(subBinDir, name.endsWith('.exe') ? name : `${name}.exe`);
                if (fileExists(targetFile)) return targetFile;
              }
            }
          }
        }
      } catch {
        // Ignore read errors
      }
    }
  }
  return null;
}

function checkSystemBinary(binNames) {
  return new Promise((resolve) => {
    if (isWindows) {
      const namesWithExe = binNames.map(n => n.endsWith('.exe') ? n : `${n}.exe`);
      const cmd = `where.exe ${namesWithExe.join(' ')}`;
      exec(cmd, (err, stdout) => {
        if (!err && stdout) {
          const firstPath = stdout.trim().split(/\r?\n/)[0].trim();
          if (firstPath && fileExists(firstPath)) return resolve(firstPath);
        }
        const found = findInWindowsPaths(binNames);
        resolve(found);
      });
    } else {
      const cmd = `command -v ${binNames.join(' || command -v ')}`;
      exec(cmd, (err, stdout) => {
        const bin = (stdout || '').trim().split('\n').pop();
        if (!err && bin) resolve(path.basename(bin));
        else resolve(null);
      });
    }
  });
}

function checkDockerAvailable() {
  return new Promise((resolve) => {
    const cmd = isWindows ? 'where.exe docker.exe' : 'command -v docker';
    exec(cmd, (err, stdout) => {
      resolve(!err && !!(stdout || '').trim());
    });
  });
}

async function findContainerDumpBinary() {
  const hasDocker = await checkDockerAvailable();
  if (!hasDocker) return null;
  const cmd = `docker exec ${DB_CONTAINER} sh -c 'command -v mariadb-dump || command -v mysqldump'`;
  return new Promise((resolve) => {
    exec(cmd, (err, stdout) => {
      const bin = (stdout || '').trim().split('\n').pop();
      if (!err && bin) resolve(path.basename(bin));
      else resolve(null);
    });
  });
}

async function findContainerMysqlBinary() {
  const hasDocker = await checkDockerAvailable();
  if (!hasDocker) return null;
  const cmd = `docker exec ${DB_CONTAINER} sh -c 'command -v mariadb || command -v mysql'`;
  return new Promise((resolve) => {
    exec(cmd, (err, stdout) => {
      const bin = (stdout || '').trim().split('\n').pop();
      if (!err && bin) resolve(path.basename(bin));
      else resolve(null);
    });
  });
}

async function getDumpCommand(host) {
  const envPath = (process.env.MYSQL_DUMP_PATH || process.env.MYSQLDUMP_PATH || '').trim().replace(/^["']|["']$/g, '');
  if (envPath && fileExists(envPath)) {
    return { isDocker: false, bin: envPath };
  }

  const hostBin = await checkSystemBinary(['mariadb-dump', 'mysqldump']);
  if (hostBin) {
    return { isDocker: false, bin: hostBin };
  }

  const isLocalHost = !host || host === 'localhost' || host === '127.0.0.1';
  if (isLocalHost) {
    const containerBin = await findContainerDumpBinary();
    if (containerBin) {
      return { isDocker: true, bin: containerBin, container: DB_CONTAINER };
    }
  }

  if (isWindows) {
    throw new Error(
      'Client mariadb-dump / mysqldump tidak ditemukan di Windows. ' +
      'Silakan install MariaDB/MySQL client (misal: "winget install MariaDB.Server" atau XAMPP/Laragon) ' +
      'atau tentukan lokasi binary di backend/.env: MYSQL_DUMP_PATH="C:\\\\Program Files\\\\MariaDB 10.11\\\\bin\\\\mariadb-dump.exe"'
    );
  } else {
    throw new Error(
      'Client mariadb-dump / mysqldump tidak ditemukan di server host. ' +
      'Silakan install client MariaDB pada host (contoh: "sudo apt-get install -y mariadb-client")'
    );
  }
}

async function getMysqlCommand(host) {
  const envPath = (process.env.MYSQL_BIN_PATH || process.env.MYSQL_PATH || '').trim().replace(/^["']|["']$/g, '');
  if (envPath && fileExists(envPath)) {
    return { isDocker: false, bin: envPath };
  }

  const hostBin = await checkSystemBinary(['mariadb', 'mysql']);
  if (hostBin) {
    return { isDocker: false, bin: hostBin };
  }

  const isLocalHost = !host || host === 'localhost' || host === '127.0.0.1';
  if (isLocalHost) {
    const containerBin = await findContainerMysqlBinary();
    if (containerBin) {
      return { isDocker: true, bin: containerBin, container: DB_CONTAINER };
    }
  }

  if (isWindows) {
    throw new Error(
      'Client mariadb / mysql tidak ditemukan di Windows. ' +
      'Silakan install MariaDB/MySQL client atau tentukan lokasi binary di backend/.env: ' +
      'MYSQL_BIN_PATH="C:\\\\Program Files\\\\MariaDB 10.11\\\\bin\\\\mariadb.exe"'
    );
  } else {
    throw new Error(
      'Client mariadb / mysql tidak ditemukan di server host. ' +
      'Silakan install client MariaDB pada host (contoh: "sudo apt-get install -y mariadb-client")'
    );
  }
}

async function createBackup() {
  ensureDir();
  const { user, password, host, port, db } = parseDbUrl();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `backup_${db}_${timestamp}.sql`;
  const filepath = path.join(BACKUP_DIR, filename);

  const dumpCmd = await getDumpCommand(host);
  let spawnCmd, spawnArgs;

  const baseArgs = [
    '-h', host,
    '-P', String(port),
    `-u${user}`,
    `-p${password}`,
    '--single-transaction',
    '--routines',
    '--triggers',
    db,
  ];

  if (dumpCmd.isDocker) {
    spawnCmd = 'docker';
    spawnArgs = ['exec', dumpCmd.container, dumpCmd.bin, ...baseArgs];
  } else {
    spawnCmd = dumpCmd.bin;
    spawnArgs = baseArgs;
  }

  return new Promise((resolve, reject) => {
    const child = spawn(spawnCmd, spawnArgs);
    const out = fs.createWriteStream(filepath);
    let stderr = '';

    child.stdout.pipe(out);
    child.stderr.on('data', d => { stderr += d.toString(); });
    child.on('error', err => {
      out.destroy();
      fs.unlink(filepath, () => {});
      reject(new Error(`Gagal menjalankan ${spawnCmd}: ${err.message}`));
    });
    out.on('error', err => {
      child.kill();
      fs.unlink(filepath, () => {});
      reject(new Error(`Gagal menulis file backup: ${err.message}`));
    });
    child.on('close', code => {
      if (code !== 0) {
        fs.unlink(filepath, () => {});
        return reject(new Error(`Gagal membuat backup (exit ${code}): ${stderr.trim() || 'unknown error'}`));
      }
      resolve({ filename, filepath, size: fs.statSync(filepath).size });
    });
  });
}

async function listBackups() {
  ensureDir();
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.endsWith('.sql'))
    .map(f => {
      const st = fs.statSync(path.join(BACKUP_DIR, f));
      return { filename: f, size: st.size, created_at: st.birthtime };
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return files;
}

async function resolveBackupPath(name) {
  const safe = sanitizeName(name);
  const filepath = path.join(BACKUP_DIR, safe);
  if (!fs.existsSync(filepath)) throw new Error('File backup tidak ditemukan');
  return filepath;
}

async function deleteBackup(name) {
  const filepath = await resolveBackupPath(name);
  fs.unlinkSync(filepath);
  return { deleted: name };
}

async function restoreBackup(name) {
  const filepath = await resolveBackupPath(name);
  const { user, password, host, port, db } = parseDbUrl();
  const mysqlCmd = await getMysqlCommand(host);

  let spawnCmd, spawnArgs;
  const baseArgs = [
    '-h', host,
    '-P', String(port),
    `-u${user}`,
    `-p${password}`,
    db,
  ];

  if (mysqlCmd.isDocker) {
    spawnCmd = 'docker';
    spawnArgs = ['exec', '-i', mysqlCmd.container, mysqlCmd.bin, ...baseArgs];
  } else {
    spawnCmd = mysqlCmd.bin;
    spawnArgs = baseArgs;
  }

  return new Promise((resolve, reject) => {
    let rejected = false;
    const fail = (err) => {
      if (rejected) return;
      rejected = true;
      reject(err);
    };

    const child = spawn(spawnCmd, spawnArgs);
    const fileStream = fs.createReadStream(filepath);
    let stderr = '';

    child.stdin.on('error', (err) => {
      fileStream.destroy();
      if (err.code !== 'EPIPE') {
        fail(new Error(`Gagal menulis ke proses restore: ${err.message}`));
      }
    });

    fileStream.pipe(child.stdin);
    child.stderr.on('data', d => { stderr += d.toString(); });
    child.on('error', err => {
      fileStream.destroy();
      fail(new Error(`Gagal menjalankan ${spawnCmd}: ${err.message}`));
    });
    fileStream.on('error', err => {
      child.stdin.end();
      child.kill();
      fail(new Error(`Gagal membaca file backup: ${err.message}`));
    });
    child.on('close', code => {
      fileStream.destroy();
      if (code !== 0) {
        return fail(new Error(`Gagal restore backup (exit ${code}): ${stderr.trim() || 'unknown error'}`));
      }
      if (!rejected) {
        resolve({ filename: path.basename(filepath), restored: true });
      }
    });
  });
}

async function saveUploadedBackup(file) {
  ensureDir();
  if (!file || !file.originalname) {
    throw new Error('File backup tidak ditemukan');
  }
  const name = sanitizeName(file.originalname);
  const filepath = path.join(BACKUP_DIR, name);
  fs.writeFileSync(filepath, file.buffer);
  const st = fs.statSync(filepath);
  return { filename: name, size: st.size, filepath };
}

module.exports = { createBackup, listBackups, resolveBackupPath, deleteBackup, restoreBackup, saveUploadedBackup, BACKUP_DIR };
