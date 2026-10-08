const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const BACKUP_DIR = process.env.BACKUP_DIR || path.join(process.cwd(), '..', 'uploads', 'backups');
const DB_CONTAINER = process.env.DB_CONTAINER_NAME || 'mariadb-local';

function ensureDir() {
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function parseDbUrl() {
  const url = process.env.DATABASE_URL || '';
  const m = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:/]+):(\d+)\/(.+)/);
  if (!m) throw new Error('DATABASE_URL tidak valid');
  return { user: m[1], password: m[2], db: m[5] };
}

function sanitizeName(name) {
  if (!name || !/^[\w.-]+\.sql$/.test(name)) throw new Error('Nama file tidak valid');
  return name;
}

// Cari binary dump di dalam container (mariadb-dump untuk MariaDB >= 10.5, mysqldump untuk versi lama)
function findDumpBinary() {
  const cmd = `docker exec ${DB_CONTAINER} sh -c 'command -v mariadb-dump || command -v mysqldump'`;
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout) => {
      const bin = (stdout || '').trim().split('\n').pop();
      if (err || !bin) {
        return reject(new Error(
          `Tidak menemukan mariadb-dump/mysqldump di container "${DB_CONTAINER}". ` +
          `Pastikan container berjalan dan memiliki client MariaDB/MySQL.`
        ));
      }
      resolve(path.basename(bin));
    });
  });
}

// Cari binary mysql client di dalam container
function findMysqlBinary() {
  const cmd = `docker exec ${DB_CONTAINER} sh -c 'command -v mariadb || command -v mysql'`;
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout) => {
      const bin = (stdout || '').trim().split('\n').pop();
      if (err || !bin) {
        return reject(new Error(
          `Tidak menemukan mariadb/mysql client di container "${DB_CONTAINER}". ` +
          `Pastikan container berjalan dan memiliki client MariaDB/MySQL.`
        ));
      }
      resolve(path.basename(bin));
    });
  });
}

async function createBackup() {
  ensureDir();
  const { user, password, db } = parseDbUrl();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `backup_${db}_${timestamp}.sql`;
  const filepath = path.join(BACKUP_DIR, filename);

  const dumpBin = await findDumpBinary();
  const args = [
    'exec', DB_CONTAINER, dumpBin,
    `-u${user}`, `-p${password}`,
    '--single-transaction', '--routines', '--triggers',
    db,
  ];

  return new Promise((resolve, reject) => {
    const child = spawn('docker', args);
    const out = fs.createWriteStream(filepath);
    let stderr = '';

    child.stdout.pipe(out);
    child.stderr.on('data', d => { stderr += d.toString(); });
    child.on('error', err => {
      out.destroy();
      fs.unlink(filepath, () => {});
      reject(new Error(`Gagal menjalankan docker exec: ${err.message}`));
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
  const { user, password, db } = parseDbUrl();
  const mysqlBin = await findMysqlBinary();

  const args = [
    'exec', DB_CONTAINER, mysqlBin,
    `-u${user}`, `-p${password}`,
    db,
  ];

  return new Promise((resolve, reject) => {
    const child = spawn('docker', args);
    const fileStream = fs.createReadStream(filepath);
    let stderr = '';

    fileStream.pipe(child.stdin);
    child.stderr.on('data', d => { stderr += d.toString(); });
    child.on('error', err => {
      fileStream.destroy();
      reject(new Error(`Gagal menjalankan docker exec: ${err.message}`));
    });
    fileStream.on('error', err => {
      child.kill();
      reject(new Error(`Gagal membaca file backup: ${err.message}`));
    });
    child.on('close', code => {
      if (code !== 0) {
        return reject(new Error(`Gagal restore backup (exit ${code}): ${stderr.trim() || 'unknown error'}`));
      }
      resolve({ filename: path.basename(filepath), restored: true });
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
