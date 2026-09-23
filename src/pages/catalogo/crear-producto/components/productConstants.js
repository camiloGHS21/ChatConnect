/**
 * @fileoverview Acceso a datos maestros y catálogos de productos.
 * Todas las constantes y datos maestros residen exclusivamente en la base de datos
 * PostgreSQL (DOC 02) a través de productoService.
 * Queda prohibido el almacenamiento de datos falsos o mock estáticos en este archivo.
 */

import productoService from '@/services/productoService';

/**
 * Obtiene los catálogos maestros actualizados directamente desde PostgreSQL.
 * @param {number} empresaId
 * @returns {Promise<Object>} Catálogos reales (categorías, marcas, impuestos, etc.)
 */
export const obtenerCatalogosMaestros = async (empresaId = 1) => {
  return await productoService.getCatalogos(empresaId);
};

/**
 * Obtiene el siguiente código autosecuencial oficial desde PostgreSQL.
 * @param {number} empresaId
 * @returns {Promise<string>}
 */
export const obtenerSiguienteCodigoOficial = async (empresaId = 1) => {
  return await productoService.getSiguienteCodigo(empresaId);
};

export default {
  obtenerCatalogosMaestros,
  obtenerSiguienteCodigoOficial,
};
