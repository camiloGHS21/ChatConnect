/**
 * Sugerencias y cálculos de redondeo comercial para COP.
 */
export const getCommercialRoundingSuggestions = (amount) => {
  const val = parseFloat(amount) || 0;
  if (val <= 0) return [];
  const suggestions = [];

  if (val % 100 !== 0) {
    const to100 = Math.ceil(val / 100) * 100;
    if (to100 > val) {
      suggestions.push({
        label: `$${to100.toLocaleString('es-CO')}`,
        value: to100,
        desc: 'A $100 COP'
      });
    }
  }

  let steps = [1000, 2000, 5000];
  if (val < 50000) steps = [200, 500, 1000, 2000, 5000];
  else if (val < 500000) steps = [1000, 2000, 5000, 10000, 20000];
  else if (val < 5000000) steps = [5000, 10000, 20000, 100000];
  else steps = [20000, 100000, 500000, 1000000];

  for (const step of steps) {
    const rounded = Math.ceil(val / step) * step;
    if (rounded > val && !suggestions.some(s => s.value === rounded)) {
      suggestions.push({
        label: `$${rounded.toLocaleString('es-CO')}`,
        value: rounded,
        desc: `A $${step.toLocaleString('es-CO')}`
      });
      if (suggestions.length >= 3) break;
    }
  }
  return suggestions.slice(0, 3);
};

export const calculateSmartCommercialRound = (currentVal) => {
  const val = parseFloat(currentVal) || 0;
  if (val <= 0) return 0;
  if (val % 100 !== 0) return Math.ceil(val / 100) * 100;
  if (val < 20000 && val % 200 !== 0) return Math.ceil(val / 200) * 200;
  if (val < 50000 && val % 500 !== 0) return Math.ceil(val / 500) * 500;
  if (val < 100000 && val % 1000 !== 0) return Math.ceil(val / 1000) * 1000;
  if (val < 200000 && val % 2000 !== 0) return Math.ceil(val / 2000) * 2000;
  if (val < 500000 && val % 5000 !== 0) return Math.ceil(val / 5000) * 5000;
  if (val < 1000000 && val % 10000 !== 0) return Math.ceil(val / 10000) * 10000;
  return Math.ceil(val / 20000) * 20000;
};
