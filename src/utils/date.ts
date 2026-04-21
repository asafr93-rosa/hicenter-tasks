export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

export function isOverdue(dueDate: string, status: string): boolean {
  if (!dueDate || status === 'done') return false;
  const today = new Date().toISOString().split('T')[0];
  return dueDate < today;
}

export function today(): string {
  return new Date().toISOString().split('T')[0];
}
