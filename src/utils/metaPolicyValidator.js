/**
 * Validador y detector de riesgos según las Políticas de Comercio de Meta (WhatsApp Business).
 * Identifica palabras y patrones que activan revisiones lentas, rechazos o bloqueos por el robot de Meta.
 */

const RISK_KEYWORDS = [
  { pattern: /\br[eé]plica\b/i, word: 'réplica', reason: 'Infracción de marca registrada / falsificación' },
  { pattern: /\bcopia\s+exacta\b/i, word: 'copia exacta', reason: 'Infracción de marca registrada' },
  { pattern: /\bimitaci[oó]n\b/i, word: 'imitación', reason: 'Infracción de marca registrada' },
  { pattern: /\bclon\b/i, word: 'clon', reason: 'Infracción de marca registrada' },
  { pattern: /\bfalsificaci[oó]n\b/i, word: 'falsificación', reason: 'Comercio prohibido por Meta' },
  { pattern: /\b[aá]cido\s+muri[aá]tico\b/i, word: 'ácido muriático', reason: 'Químico peligroso regulado' },
  { pattern: /\bveneno\b/i, word: 'veneno', reason: 'Sustancia tóxica / peligrosa' },
  { pattern: /\bpesticida\b/i, word: 'pesticida', reason: 'Sustancia química regulada' },
  { pattern: /\bplaguicida\b/i, word: 'plaguicida', reason: 'Sustancia química regulada' },
  { pattern: /\bp[oó]lvora\b/i, word: 'pólvora', reason: 'Explosivo / producto regulado' },
  { pattern: /\bfulminante\b/i, word: 'fulminante', reason: 'Material inflamable / explosivo' },
  { pattern: /\bmunici[oó]n\b/i, word: 'munición', reason: 'Armamento / munición prohibida' },
  { pattern: /\bpistola\s+de\s+fuego\b/i, word: 'pistola de fuego', reason: 'Arma prohibida por Meta' },
  { pattern: /\bcigarrillo\b/i, word: 'cigarrillo', reason: 'Tabaco / nicotina prohibida' },
  { pattern: /\bvapeador|vape\b/i, word: 'vapeador', reason: 'Dispositivos de vapeo prohibidos' },
  { pattern: /\bmarihuana|cannabis|cbd\b/i, word: 'cannabis/CBD', reason: 'Sustancia regulada por Meta' },
  { pattern: /\bdroga|estupefaciente\b/i, word: 'droga', reason: 'Sustancia ilícita prohibida' },
];

export const checkMetaCompliance = (title = '', description = '') => {
  const warnings = [];
  const fullText = `${title} ${description}`;

  // 1. Revisar palabras de riesgo
  for (const item of RISK_KEYWORDS) {
    if (item.pattern.test(fullText)) {
      warnings.push({
        type: 'risk_word',
        word: item.word,
        reason: item.reason,
        message: `La palabra "${item.word}" puede ser retenida o rechazada por el robot de Meta (${item.reason}).`,
      });
    }
  }

  // 2. Revisar si el título está todo en MAYÚSCULAS
  const cleanTitle = title.trim().replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '');
  if (cleanTitle.length > 5 && cleanTitle === cleanTitle.toUpperCase()) {
    warnings.push({
      type: 'all_caps',
      word: 'MAYÚSCULAS',
      reason: 'Spam comercial',
      message: 'El título está completamente en MAYÚSCULAS. Meta penaliza títulos en mayúscula sostenida.',
    });
  }

  // 3. Revisar si incluye enlaces web o correos en descripción
  if (/https?:\/\/|www\./i.test(description)) {
    warnings.push({
      type: 'links',
      word: 'Enlace web',
      reason: 'Enlaces externos',
      message: 'Los enlaces web en la descripción suelen retrasar la aprobación y son filtrados por el sistema.',
    });
  }

  return {
    isClean: warnings.length === 0,
    warnings,
  };
};
