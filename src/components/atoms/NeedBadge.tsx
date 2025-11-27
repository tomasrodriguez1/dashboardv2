/**
 * Badge para mostrar alertas de necesidades de repuestos.
 */

import type { AlertLevel } from '@domain/metrics.needs';

export interface NeedBadgeProps {
  level: AlertLevel;
  diasRestantes?: number;
}

export function NeedBadge({ level, diasRestantes }: NeedBadgeProps) {
  const getStyles = () => {
    switch (level) {
      case 'ROJO':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-300',
          label: 'URGENTE',
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

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles.bg} ${styles.text} ${styles.border}`}
      title={diasRestantes !== undefined ? `${diasRestantes} días restantes` : undefined}
    >
      {styles.label}
      {diasRestantes !== undefined && ` (${diasRestantes}d)`}
    </span>
  );
}

