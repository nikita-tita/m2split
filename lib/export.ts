import { Registry, RegistryPaymentLine, Deal } from '@/types';
import { formatDate, formatCurrency } from './validations';

// Export registry to CSV
export const exportRegistryToCSV = (registry: Registry): string => {
  const headers = [
    'Получатель',
    'ИНН',
    'Счёт',
    'БИК',
    'Сумма',
    'Режим налогообложения',
    'Ставка НДС',
    'Договор №',
    'Дата договора',
    'Комментарий',
  ];

  const rows = registry.lines.map((line) => [
    line.contractor?.name || '',
    line.inn,
    line.accountNumber,
    line.bik,
    line.amount.toFixed(2),
    line.taxRegime,
    line.vatRate?.toString() || '',
    line.contractNumber || '',
    line.contractDate ? formatDate(line.contractDate) : '',
    line.comment || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
};

// Export registry to JSON (bank format)
export const exportRegistryToJSON = (registry: Registry): string => {
  const data = {
    registryId: registry.id,
    registryNumber: registry.registryNumber,
    date: formatDate(registry.date),
    totalAmount: registry.totalAmount,
    linesCount: registry.linesCount,
    lines: registry.lines.map((line) => ({
      recipientName: line.contractor?.name || '',
      inn: line.inn,
      account: line.accountNumber,
      bik: line.bik,
      amount: line.amount,
      taxRegime: line.taxRegime,
      vatRate: line.vatRate,
      contractNumber: line.contractNumber,
      contractDate: line.contractDate ? formatDate(line.contractDate) : null,
      comment: line.comment,
    })),
  };

  return JSON.stringify(data, null, 2);
};

// Export deals to CSV
export const exportDealsToCSV = (deals: Deal[]): string => {
  const headers = [
    '№ сделки',
    'Объект',
    'Адрес',
    'Лот',
    'Сумма КВН',
    'Статус',
    'Дата создания',
  ];

  const rows = deals.map((deal) => [
    deal.id,
    deal.objectName,
    deal.objectAddress,
    deal.lotNumber || '',
    deal.totalAmount.toFixed(2),
    deal.status,
    formatDate(deal.createdAt),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
};

// Download file helper
export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export registry as CSV file
export const downloadRegistryCSV = (registry: Registry) => {
  const csv = exportRegistryToCSV(registry);
  downloadFile(
    csv,
    `registry_${registry.registryNumber}_${formatDate(new Date())}.csv`,
    'text/csv;charset=utf-8;'
  );
};

// Export registry as JSON file
export const downloadRegistryJSON = (registry: Registry) => {
  const json = exportRegistryToJSON(registry);
  downloadFile(
    json,
    `registry_${registry.registryNumber}_${formatDate(new Date())}.json`,
    'application/json'
  );
};

// Export deals as CSV file
export const downloadDealsCSV = (deals: Deal[]) => {
  const csv = exportDealsToCSV(deals);
  downloadFile(
    csv,
    `deals_${formatDate(new Date())}.csv`,
    'text/csv;charset=utf-8;'
  );
};
