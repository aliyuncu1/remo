export function cn(...inputs: (string | undefined | null | false | Record<string, boolean>)[]) {
  return inputs.map(i => {
    if (typeof i === 'string') return i;
    if (typeof i === 'object' && i !== null) {
      return Object.entries(i).filter(([, v]) => v).map(([k]) => k).join(' ');
    }
    return '';
  }).filter(Boolean).join(' ');
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function severityColor(severity: string): string {
  switch (severity) {
    case 'critical': return 'bg-red-100 text-red-800 border-red-200';
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function statusColor(status: string): string {
  switch (status) {
    case 'new': return 'bg-blue-100 text-blue-800';
    case 'needs_review': return 'bg-yellow-100 text-yellow-800';
    case 'missing_info': return 'bg-orange-100 text-orange-800';
    case 'high_risk': return 'bg-red-100 text-red-800';
    case 'ready_to_reply': return 'bg-green-100 text-green-800';
    case 'completed': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export function statusLabel(status: string): string {
  switch (status) {
    case 'new': return 'New';
    case 'needs_review': return 'Needs Review';
    case 'missing_info': return 'Missing Info';
    case 'high_risk': return 'High Risk';
    case 'ready_to_reply': return 'Ready to Reply';
    case 'completed': return 'Completed';
    default: return status;
  }
}

export function truncate(str: string, len: number): string {
  if (str.length <= len) return str;
  return str.slice(0, len) + '…';
}

export function exportToCSV(rows: Record<string, string>[], filename: string) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map(row => headers.map(h => `"${(row[h] || '').replace(/"/g, '""')}"`).join(',')),
  ].join('\n');
  downloadFile(csv, filename, 'text/csv');
}

export function exportToJSON(data: unknown, filename: string) {
  downloadFile(JSON.stringify(data, null, 2), filename, 'application/json');
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
