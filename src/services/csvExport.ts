import { Business } from '../types';

/**
 * Exports the list of businesses to a standard, Excel-compatible CSV file with UTF-8 BOM.
 */
export function exportBusinessesToCSV(businesses: Business[]): void {
  const headers = [
    'ID',
    'Nombre',
    'Categoría',
    'Dirección',
    'Latitud',
    'Longitud',
    'Descripción',
    'Horario',
    'Teléfono',
    'Instagram',
    'Etiquetas',
    'URL_Foto',
    'Fecha_Registro',
  ];

  const escapeCSV = (value: string | number | undefined | null) => {
    if (value === undefined || value === null) return '""';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = businesses.map((b) => [
    escapeCSV(b.id),
    escapeCSV(b.name),
    escapeCSV(b.category),
    escapeCSV(b.address),
    escapeCSV(b.lat),
    escapeCSV(b.lng),
    escapeCSV(b.description),
    escapeCSV(b.openingHours),
    escapeCSV(b.phone || ''),
    escapeCSV(b.instagram || ''),
    escapeCSV(b.tags.join(', ')),
    escapeCSV(b.imageUrl),
    escapeCSV(new Date(b.createdAt).toLocaleDateString('es-CL')),
  ]);

  const csvLines = [headers.map(escapeCSV).join(','), ...rows.map((r) => r.join(','))];
  const csvContent = csvLines.join('\r\n');

  // Prepend UTF-8 BOM for perfect rendering in Microsoft Excel, Google Sheets, LibreOffice, and mobile apps
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toISOString().slice(0, 10);
  a.download = `elei_cafeterias_los_angeles_${dateStr}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
