import { execSync } from 'node:child_process';

console.log('\n🧹 Limpiando procesos de Frontend (5173) y Backend (3000)...');

const isWindows = process.platform === 'win32';

if (isWindows) {
  // 1. Matar procesos escuchando en 3000 y 5173
  try {
    const psCmd = `powershell -NoProfile -Command "Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -in 3000, 5173 } | Select-Object -ExpandProperty OwningProcess -Unique"`;
    const output = execSync(psCmd, { encoding: 'utf8' }).trim();
    if (output) {
      const pids = output.split(/\r?\n/).map(p => p.trim()).filter(Boolean);
      for (const pid of pids) {
        try {
          execSync(`taskkill /pid ${pid} /T /F`);
          console.log(`✅ Proceso en puerto (PID ${pid}) detenido.`);
        } catch {
          // Ignorar si ya se cerró
        }
      }
    } else {
      console.log('ℹ️ No hay procesos ocupando los puertos 3000 ni 5173.');
    }
  } catch {
    console.log('ℹ️ Verificación de puertos completada.');
  }

  // 2. Cerrar instancias de nest.exe si quedaron activas
  try {
    execSync(`powershell -NoProfile -Command "Stop-Process -Name nest -Force -ErrorAction SilentlyContinue"`);
  } catch {}
} else {
  try {
    execSync('fuser -k 3000/tcp 5173/tcp 2>/dev/null || true');
  } catch {}
}

console.log('✨ Puertos y procesos completamente liberados.\n');
