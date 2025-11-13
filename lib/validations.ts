import { TaxRegime, VATRate } from '@/types';

// INN validation
export const validateINN = (inn: string): boolean => {
  if (!inn) return false;
  const innRegex = /^(\d{10}|\d{12})$/;
  return innRegex.test(inn);
};

// Account number validation (20 digits)
export const validateAccountNumber = (account: string): boolean => {
  if (!account) return false;
  const accountRegex = /^\d{20}$/;
  return accountRegex.test(account);
};

// BIK validation (9 digits)
export const validateBIK = (bik: string): boolean => {
  if (!bik) return false;
  const bikRegex = /^\d{9}$/;
  return bikRegex.test(bik);
};

// VAT rate validation for tax regime
export const validateVATRate = (taxRegime: TaxRegime, vatRate?: VATRate): boolean => {
  if (taxRegime === 'OSN' && vatRate === undefined) {
    return false;
  }
  if (taxRegime !== 'OSN' && vatRate !== undefined) {
    return false;
  }
  return true;
};

// Sum validation (positive number with max 2 decimal places)
export const validateAmount = (amount: number): boolean => {
  if (amount <= 0) return false;
  const decimals = amount.toString().split('.')[1];
  if (decimals && decimals.length > 2) return false;
  return true;
};

// Validate shares sum to 100%
export const validateSharesTotal = (shares: { sharePercent: number }[]): boolean => {
  const total = shares.reduce((sum, share) => sum + share.sharePercent, 0);
  return Math.abs(total - 100) < 0.01; // Allow for floating point errors
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format date
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
};

// Format datetime
export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

// Tax regime display names
export const getTaxRegimeLabel = (regime: TaxRegime): string => {
  const labels: Record<TaxRegime, string> = {
    OSN: 'НДС',
    USN: 'УСН',
    NPD: 'НПД',
  };
  return labels[regime];
};

// Validation error messages
export const getValidationError = (field: string, value: any): string | null => {
  switch (field) {
    case 'inn':
      return !validateINN(value) ? 'ИНН должен содержать 10 или 12 цифр' : null;
    case 'account':
      return !validateAccountNumber(value) ? 'Номер счёта должен содержать 20 цифр' : null;
    case 'bik':
      return !validateBIK(value) ? 'БИК должен содержать 9 цифр' : null;
    case 'amount':
      return !validateAmount(value) ? 'Сумма должна быть положительным числом с максимум 2 знаками после запятой' : null;
    default:
      return null;
  }
};
