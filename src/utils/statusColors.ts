// utils/statusColors.ts

export const STATUS_COLORS: Record<number, string> = {
  0: '#f4b400',
  1: '#4caf50',
  2: '#e53935',
  3: '#5a9bd4',
  4: '#f79646',
  6: '#f4b400',
  7: '#f4b400',
  8: '#f4b400',
  9: '#f79646',
};

export function getStatusColor(idStatus?: number): string {
  if (idStatus == null) return '#9e9e9e';
  return STATUS_COLORS[idStatus] || '#9e9e9e';
}
