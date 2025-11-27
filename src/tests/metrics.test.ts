/**
 * Tests para funciones de métricas.
 * 
 * Prueba que safeSum funcione correctamente con diferentes escenarios
 * y que todas las funciones de cálculo sean consistentes.
 */

import { describe, it, expect } from 'vitest';
import {
  safeSum,
  sumBy,
  conversion,
  participation,
  percentile75,
  topNBy,
  mean,
  stdDev,
} from '@domain/metrics';

describe('safeSum', () => {
  it('suma correctamente valores positivos', () => {
    const values = [1, 2, 3, 4, 5];
    expect(safeSum(values)).toBe(15);
  });

  it('suma correctamente valores grandes', () => {
    const values = [1000000, 2000000, 3000000];
    expect(safeSum(values)).toBe(6000000);
  });

  it('maneja valores decimales sin pérdida significativa', () => {
    const values = [0.1, 0.2, 0.3];
    const result = safeSum(values);
    expect(result).toBeCloseTo(0.6, 10);
  });

  it('ignora null y undefined', () => {
    const values = [1, null as any, 2, undefined as any, 3];
    expect(safeSum(values)).toBe(6);
  });

  it('ignora NaN', () => {
    const values = [1, NaN, 2, 3];
    expect(safeSum(values)).toBe(6);
  });

  it('retorna 0 para array vacío', () => {
    expect(safeSum([])).toBe(0);
  });

  it('maneja valores negativos', () => {
    const values = [10, -5, 3, -2];
    expect(safeSum(values)).toBe(6);
  });

  it('es más preciso que reduce simple para muchos valores pequeños', () => {
    // Crear 10000 valores pequeños
    const values = Array(10000).fill(0.1);
    
    const resultSafeSum = safeSum(values);
    const resultReduce = values.reduce((a, b) => a + b, 0);
    
    // Ambos deberían ser cercanos a 1000
    expect(resultSafeSum).toBeCloseTo(1000, 5);
    
    // safeSum debería ser más preciso o igual
    const errorSafeSum = Math.abs(resultSafeSum - 1000);
    const errorReduce = Math.abs(resultReduce - 1000);
    
    expect(errorSafeSum).toBeLessThanOrEqual(errorReduce);
  });
});

describe('sumBy', () => {
  it('suma correctamente usando un selector', () => {
    const items = [
      { name: 'A', value: 10 },
      { name: 'B', value: 20 },
      { name: 'C', value: 30 },
    ];
    
    expect(sumBy(items, item => item.value)).toBe(60);
  });

  it('retorna 0 para array vacío', () => {
    expect(sumBy([], item => (item as any).value)).toBe(0);
  });

  it('maneja selectores que retornan null', () => {
    const items = [
      { value: 10 },
      { value: null as any },
      { value: 20 },
    ];
    
    expect(sumBy(items, item => item.value)).toBe(30);
  });
});

describe('conversion', () => {
  it('calcula conversión correctamente', () => {
    expect(conversion(50, 100)).toBe(0.5);
  });

  it('retorna 0 cuando potencial es 0', () => {
    expect(conversion(50, 0)).toBe(0);
  });

  it('retorna 0 cuando venta es 0', () => {
    expect(conversion(0, 100)).toBe(0);
  });

  it('maneja valores grandes', () => {
    expect(conversion(5000000, 10000000)).toBe(0.5);
  });

  it('puede retornar valores mayores a 1', () => {
    // En casos donde la venta supera el potencial
    expect(conversion(150, 100)).toBe(1.5);
  });
});

describe('participation', () => {
  it('calcula participación correctamente', () => {
    expect(participation(25, 100)).toBe(0.25);
  });

  it('retorna 0 cuando total es 0', () => {
    expect(participation(25, 0)).toBe(0);
  });

  it('puede retornar 1 cuando part igual a total', () => {
    expect(participation(100, 100)).toBe(1);
  });
});

describe('percentile75', () => {
  it('calcula el percentil 75 correctamente', () => {
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const p75 = percentile75(values);
    
    // El percentil 75 debería estar alrededor de 7.5-8
    expect(p75).toBeGreaterThanOrEqual(7);
    expect(p75).toBeLessThanOrEqual(8);
  });

  it('retorna 0 para array vacío', () => {
    expect(percentile75([])).toBe(0);
  });

  it('maneja array con un solo elemento', () => {
    expect(percentile75([5])).toBe(5);
  });

  it('ignora valores no finitos', () => {
    const values = [1, 2, NaN, 3, Infinity, 4];
    const p75 = percentile75(values);
    
    expect(isFinite(p75)).toBe(true);
  });
});

describe('topNBy', () => {
  it('retorna los top N elementos', () => {
    const items = [
      { name: 'A', value: 10 },
      { name: 'B', value: 50 },
      { name: 'C', value: 30 },
      { name: 'D', value: 20 },
    ];
    
    const top2 = topNBy(items, item => item.value, 2);
    
    expect(top2).toHaveLength(2);
    expect(top2[0].name).toBe('B');
    expect(top2[1].name).toBe('C');
  });

  it('retorna array vacío cuando n es 0', () => {
    const items = [{ value: 10 }];
    expect(topNBy(items, item => item.value, 0)).toHaveLength(0);
  });

  it('retorna todos los elementos si n > length', () => {
    const items = [
      { value: 10 },
      { value: 20 },
    ];
    
    const top5 = topNBy(items, item => item.value, 5);
    expect(top5).toHaveLength(2);
  });
});

describe('mean', () => {
  it('calcula la media correctamente', () => {
    expect(mean([1, 2, 3, 4, 5])).toBe(3);
  });

  it('retorna 0 para array vacío', () => {
    expect(mean([])).toBe(0);
  });

  it('ignora valores no finitos', () => {
    const values = [1, 2, NaN, 3];
    expect(mean(values)).toBe(2); // (1 + 2 + 3) / 3
  });
});

describe('stdDev', () => {
  it('calcula la desviación estándar correctamente', () => {
    const values = [2, 4, 4, 4, 5, 5, 7, 9];
    const sd = stdDev(values);
    
    // La desviación estándar debería ser alrededor de 2
    expect(sd).toBeCloseTo(2, 0);
  });

  it('retorna 0 para array vacío', () => {
    expect(stdDev([])).toBe(0);
  });

  it('retorna 0 para valores idénticos', () => {
    expect(stdDev([5, 5, 5, 5])).toBe(0);
  });
});

