/**
 * Badge para mostrar el estado de una mantención de repuestos.
 */

import type { AlertLevel } from '@domain/metrics.needs';

export interface NeedBadgeProps {
  level: AlertLevel;
  diasRestantes?: number;
}

export function NeedBadge({ level, diasRestantes }: NeedBadgeProps) {
  const isAtrasada = level === 'ROJO' && diasRestantes !== undefined && diasRestantes < 0;

  const getStyles = () => {
    switch (level) {
      case 'COMPLETADA':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          border: 'border-blue-300',
          label: 'HECHO',
        };
      case 'ROJO':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-300',
          label: isAtrasada ? 'ATRASADO' : 'URGENTE',
        };
      case 'AMARILLO':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-300',
          label: 'PRÓXIMO',
        };
      case 'OK':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-300',
          label: 'OK',
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-300',
          label: 'N/A',
        };
    }
  };

  const styles = getStyles();
  const diasLabel =
    level !== 'COMPLETADA' && diasRestantes !== undefined
      ? ` (${diasRestantes}d)`
      : '';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles.bg} ${styles.text} ${styles.border}`}
      title={
        level === 'COMPLETADA'
          ? 'Mantención completada'
          : diasRestantes !== undefined
          ? `${diasRestantes} días restantes`
          : undefined
      }
    >
      {styles.label}
      {diasLabel}
    </span>
  );
}
