const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

async function main() {
  const client = new Client({
    host: process.env.DB_HOST || '2.25.113.102',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'chatbotDatabase',
    user: process.env.DB_USER || 'intredete',
    password: process.env.DB_PASSWORD || 'Intre@2026VPS',
  });

  await client.connect();
  console.log('🔌 Conectado a PostgreSQL chatbotDatabase');

  // Obtener todas las empresas registradas
  const empresas = await client.query('SELECT id_empresa, razon_social FROM public.empresa');
  console.log(`Empresas encontradas: ${empresas.rows.length}`);

  const dianTaxes = [
    { codigo: 'IVA19', nombre: 'IVA General 19%', porcentaje: 19.00, tipo: 'PORCENTAJE' },
    { codigo: 'IVA5', nombre: 'IVA Diferencial 5%', porcentaje: 5.00, tipo: 'PORCENTAJE' },
    { codigo: 'IVA0', nombre: 'Exento de IVA 0%', porcentaje: 0.00, tipo: 'PORCENTAJE' },
    { codigo: 'EXCLUIDO', nombre: 'Excluido de IVA', porcentaje: 0.00, tipo: 'PORCENTAJE' },
    { codigo: 'INC8', nombre: 'Impoconsumo 8%', porcentaje: 8.00, tipo: 'PORCENTAJE' },
    { codigo: 'INC16', nombre: 'Impoconsumo 16%', porcentaje: 16.00, tipo: 'PORCENTAJE' },
  ];

  for (const emp of empresas.rows) {
    const empId = emp.id_empresa;
    console.log(`\nConfigurando Empresa ID ${empId}: ${emp.razon_social}`);

    // 1. Dejar únicamente la medida 'Unidad' con código oficial 94 de la DIAN
    await client.query(
      `UPDATE public.medida
       SET codigo = '94', nombre = 'Unidad', estado = 'activo'
       WHERE empresa_id = $1 AND (codigo = '94' OR codigo = 'UND' OR id_medida = 1);`,
      [empId]
    );

    const existsMedida94 = await client.query(
      `SELECT id_medida FROM public.medida WHERE empresa_id = $1 AND codigo = '94';`,
      [empId]
    );

    let medidaId = 1;
    if (existsMedida94.rows.length === 0) {
      const inserted = await client.query(
        `INSERT INTO public.medida (id_medida, empresa_id, codigo, nombre, estado)
         VALUES (1, $1, '94', 'Unidad', 'activo')
         RETURNING id_medida;`,
        [empId]
      );
      medidaId = inserted.rows[0].id_medida;
      console.log(`  + Medida única DIAN '94' (Unidad) creada.`);
    } else {
      medidaId = existsMedida94.rows[0].id_medida;
      console.log(`  ✔ Medida única DIAN '94' (Unidad) confirmada.`);
    }

    // Actualizar todos los productos para que usen la unidad por defecto
    await client.query(
      `UPDATE public.producto SET medida_id = $1 WHERE empresa_id = $2;`,
      [medidaId, empId]
    );

    // Eliminar las demás medidas para dejar ÚNICAMENTE Unidad
    await client.query(
      `DELETE FROM public.medida WHERE empresa_id = $1 AND codigo != '94';`,
      [empId]
    );
    console.log(`  ✔ Solo queda configurada la unidad '94' (Unidad) para facturación DIAN.`);

    // 2. Impuestos oficiales DIAN por defecto
    for (const t of dianTaxes) {
      const existing = await client.query(
        'SELECT id_impuesto FROM public.impuesto WHERE empresa_id = $1 AND codigo = $2',
        [empId, t.codigo]
      );
      if (existing.rows.length === 0) {
        await client.query(
          `INSERT INTO public.impuesto (empresa_id, codigo, nombre, porcentaje, valor, tipo, estado, created_at, updated_at)
           VALUES ($1, $2, $3, $4, NULL, $5, 'activo', now(), now());`,
          [empId, t.codigo, t.nombre, t.porcentaje, t.tipo]
        );
        console.log(`  + Impuesto DIAN agregado: ${t.codigo} - ${t.nombre}`);
      } else {
        await client.query(
          `UPDATE public.impuesto
           SET nombre = $1, porcentaje = $2, tipo = $3, estado = 'activo', updated_at = now()
           WHERE empresa_id = $4 AND codigo = $5;`,
          [t.nombre, t.porcentaje, t.tipo, empId, t.codigo]
        );
        console.log(`  ✔ Impuesto DIAN verificado: ${t.codigo} - ${t.nombre}`);
      }
    }
  }

  // Verificación
  console.log('\n--- VERIFICACIÓN FINAL ---');
  const resImps = await client.query(
    'SELECT id_impuesto AS id, empresa_id, codigo, nombre, porcentaje, tipo FROM public.impuesto ORDER BY empresa_id, id_impuesto'
  );
  console.table(resImps.rows);

  const resMeds = await client.query(
    'SELECT id_medida AS id, empresa_id, codigo, nombre FROM public.medida ORDER BY empresa_id, id_medida'
  );
  console.table(resMeds.rows);

  await client.end();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
