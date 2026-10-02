const https = require('https');
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const lowerWords = new Set(['de', 'del', 'la', 'las', 'los', 'y', 'el', 'en']);

function toTitleCase(str) {
  if (!str) return '';
  let cleaned = str.trim().replace(/,\s*d\.c\./i, ' D.C.').replace(/\s+/g, ' ');
  const parts = cleaned.split(' ');
  return parts.map((w, idx) => {
    const lw = w.toLowerCase();
    if (lw === 'd.c.' || lw === 'dc') return 'D.C.';
    if (idx > 0 && lowerWords.has(lw)) return lw;
    return lw.charAt(0).toUpperCase() + lw.slice(1);
  }).join(' ');
}

const deptoNameOverrides = {
  '11': 'Bogotá D.C.',
  '88': 'Archipiélago de San Andrés, Providencia y Santa Catalina',
  '54': 'Norte de Santander',
  '76': 'Valle del Cauca',
  '44': 'La Guajira',
};

async function fetchMunicipios() {
  console.log('📡 Descargando catálogo oficial DIVIPOLA / DANE desde datos.gov.co...');
  const jsonUrl = 'https://www.datos.gov.co/resource/gdxc-w37w.json?%24limit=5000';
  
  return new Promise((resolve, reject) => {
    https.get(jsonUrl, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Status Code: ${res.statusCode}`));
      }
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(raw);
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  const records = await fetchMunicipios();
  console.log(`✅ Registros obtenidos: ${records.length} municipios.`);

  const deptosMap = new Map();
  for (const r of records) {
    const cod = r.cod_dpto.padStart(2, '0');
    if (!deptosMap.has(cod)) {
      const nombre = deptoNameOverrides[cod] || toTitleCase(r.dpto);
      deptosMap.set(cod, nombre);
    }
  }
  console.log(`✅ Departamentos oficiales identificados: ${deptosMap.size}`);

  const client = new Client({
    host: process.env.DB_HOST || '2.25.113.102',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'chatbotDatabase',
    user: process.env.DB_USER || 'intredete',
    password: process.env.DB_PASSWORD || 'Intre@2026VPS',
  });

  await client.connect();
  console.log('🔌 Conectado a PostgreSQL chatbotDatabase.');

  try {
    await client.query('BEGIN');

    // 1. Upsert departamentos en lote
    const deptoValues = [];
    const deptoParams = [];
    let pIdx = 1;
    for (const [codigo, nombre] of deptosMap.entries()) {
      deptoValues.push(`($${pIdx++}, $${pIdx++}, 'activo', now(), now())`);
      deptoParams.push(codigo, nombre);
    }

    await client.query(`
      INSERT INTO public.departamento (codigo, nombre, estado, created_at, updated_at)
      VALUES ${deptoValues.join(', ')}
      ON CONFLICT (codigo) DO UPDATE
      SET nombre = EXCLUDED.nombre,
          estado = 'activo',
          updated_at = now();
    `, deptoParams);
    console.log('✅ 33 Departamentos insertados/actualizados correctamente.');

    // 2. Mapear IDs de departamentos
    const { rows: deptRows } = await client.query('SELECT id, codigo, nombre FROM public.departamento');
    const deptoIdMap = new Map();
    for (const d of deptRows) {
      deptoIdMap.set(d.codigo, d.id);
    }

    // 3. Preparar e insertar municipios en lotes de 100
    const formattedCities = [];
    const sqlStatements = [
      '-- ============================================================',
      '-- CATÁLOGO OFICIAL DIVIPOLA / DIAN - COLOMBIA',
      '-- Departamentos y Municipios con códigos DANE / DIAN',
      '-- ============================================================',
      '',
    ];

    for (const [codigo, nombre] of deptosMap.entries()) {
      sqlStatements.push(
        `INSERT INTO public.departamento (codigo, nombre, estado, created_at, updated_at) VALUES ('${codigo}', '${nombre.replace(/'/g, "''")}', 'activo', now(), now()) ON CONFLICT (codigo) DO UPDATE SET nombre = EXCLUDED.nombre, estado = 'activo', updated_at = now();`
      );
    }
    sqlStatements.push('');

    for (const r of records) {
      const codDpto = r.cod_dpto.padStart(2, '0');
      const idDepto = deptoIdMap.get(codDpto);
      if (!idDepto) continue;

      const codMpio = r.cod_mpio.padStart(5, '0');
      let nomMpio = toTitleCase(r.nom_mpio);
      if (codMpio === '11001') nomMpio = 'Bogotá D.C.';

      formattedCities.push({ idDepto, codMpio, nomMpio, codDpto });

      sqlStatements.push(
        `INSERT INTO public.ciudad (id_departamento, codigo, nombre, estado, created_at, updated_at) SELECT d.id, '${codMpio}', '${nomMpio.replace(/'/g, "''")}', 'activo', now(), now() FROM public.departamento d WHERE d.codigo = '${codDpto}' ON CONFLICT (id_departamento, codigo) DO UPDATE SET nombre = EXCLUDED.nombre, estado = 'activo', updated_at = now();`
      );
    }

    // Insert en lotes de 100
    const BATCH_SIZE = 100;
    for (let i = 0; i < formattedCities.length; i += BATCH_SIZE) {
      const batch = formattedCities.slice(i, i + BATCH_SIZE);
      const valPlaceholders = [];
      const valParams = [];
      let idx = 1;

      for (const item of batch) {
        valPlaceholders.push(`($${idx++}, $${idx++}, $${idx++}, 'activo', now(), now())`);
        valParams.push(item.idDepto, item.codMpio, item.nomMpio);
      }

      await client.query(`
        INSERT INTO public.ciudad (id_departamento, codigo, nombre, estado, created_at, updated_at)
        VALUES ${valPlaceholders.join(', ')}
        ON CONFLICT (id_departamento, codigo) DO UPDATE
        SET nombre = EXCLUDED.nombre,
            estado = 'activo',
            updated_at = now();
      `, valParams);
    }

    await client.query('COMMIT');
    console.log(`🎉 Transacción completada con éxito. ${formattedCities.length} ciudades y municipios guardados en PostgreSQL.`);

    // Guardar archivo SQL reproducible
    const sqlFilePath = path.resolve(__dirname, 'seed-dian-divipola.sql');
    fs.writeFileSync(sqlFilePath, sqlStatements.join('\n'), 'utf8');
    console.log(`💾 Archivo SQL guardado en: ${sqlFilePath}`);

    // Verificar estadísticas finales
    const countDept = await client.query("SELECT count(*) FROM public.departamento WHERE estado = 'activo'");
    const countCiu = await client.query("SELECT count(*) FROM public.ciudad WHERE estado = 'activo'");
    console.log(`📊 Estadísticas Finales en BD:`);
    console.log(`   - Departamentos: ${countDept.rows[0].count}`);
    console.log(`   - Ciudades / Municipios (DIAN): ${countCiu.rows[0].count}`);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error en la importación:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
