// User roles
export type UserRole = 'DEVELOPER_ADMIN' | 'M2_OPERATOR' | 'CONTRACTOR' | 'BANK_INTEGRATION';

// Tax regimes
export type TaxRegime = 'VAT' | 'USN' | 'NPD';

// VAT rates
export type VATRate = 0 | 10 | 20 | 22;

// Contractor roles
export type ContractorRole = 'AGENCY' | 'AGENT' | 'IP' | 'NPD';

// Deal statuses
export type DealStatus = 'DRAFT' | 'IN_PROGRESS' | 'IN_REGISTRY' | 'PAID' | 'PARTIALLY_PAID' | 'CANCELLED';

// Registry statuses
export type RegistryStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'SENT_TO_BANK' | 'EXECUTED' | 'PARTIALLY_EXECUTED' | 'ERROR';

// Payment statuses
export type PaymentStatus = 'PENDING' | 'ACCEPTED_BY_BANK' | 'EXECUTED' | 'ERROR';

// Primary document statuses
export type PrimaryDocStatus = 'NOT_REQUESTED' | 'REQUESTED' | 'UPLOADED' | 'VERIFIED' | 'REJECTED';

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

// Contractor interface
export interface Contractor {
  id: string;
  name: string;
  inn: string;
  kpp?: string;
  accountNumber: string;
  bik: string;
  bankName: string;
  address: string;
  taxRegime: TaxRegime;
  role: ContractorRole;
  offerAcceptedAt?: Date;
  offerAcceptanceChannel?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Deal share interface
export interface DealShare {
  id: string;
  contractorId: string;
  contractor?: Contractor;
  role: ContractorRole;
  sharePercent: number;
  amount: number;
  taxRegime: TaxRegime;
  vatRate?: VATRate;
  contractNumber?: string;
  contractDate?: Date;
}

// Deal interface
export interface Deal {
  id: string;
  objectName: string;
  objectAddress: string;
  lotNumber?: string;
  developerId: string;
  totalAmount: number;
  status: DealStatus;
  shares: DealShare[];
  contractBasis?: string;
  contractNumber?: string;
  contractDate?: Date;
  specialAccountReceiptDate?: Date;
  responsibleUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Registry payment line interface
export interface RegistryPaymentLine {
  id: string;
  registryId: string;
  contractorId: string;
  contractor?: Contractor;
  role: ContractorRole;
  inn: string;
  accountNumber: string;
  bik: string;
  amount: number;
  taxRegime: TaxRegime;
  vatRate?: VATRate;
  contractNumber?: string;
  contractDate?: Date;
  comment?: string;
  paymentStatus: PaymentStatus;
  bankErrorCode?: string;
  bankErrorText?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Registry interface
export interface Registry {
  id: string;
  registryNumber: string;
  date: Date;
  status: RegistryStatus;
  totalAmount: number;
  linesCount: number;
  creatorId: string;
  approverId?: string;
  approvedAt?: Date;
  sentToBankAt?: Date;
  executedAt?: Date;
  lines: RegistryPaymentLine[];
  rejectionComment?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Payment interface
export interface Payment {
  id: string;
  registryId: string;
  lineId: string;
  contractorId: string;
  amount: number;
  status: PaymentStatus;
  bankReference?: string;
  bankErrorCode?: string;
  bankErrorText?: string;
  executedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Primary document interface
export interface PrimaryDocument {
  id: string;
  paymentId: string;
  contractorId: string;
  documentType: 'ACT' | 'INVOICE' | 'NPD_RECEIPT';
  documentNumber: string;
  documentDate: Date;
  amount: number;
  vatAmount?: number;
  fileUrl?: string;
  status: PrimaryDocStatus;
  rejectionReason?: string;
  uploadedAt?: Date;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Audit log interface
export interface AuditLog {
  id: string;
  userId: string;
  entityType: 'DEAL' | 'REGISTRY' | 'PAYMENT' | 'CONTRACTOR' | 'DOCUMENT';
  entityId: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  createdAt: Date;
}

// Dashboard metrics interface
export interface DashboardMetrics {
  specialAccountBalance: number;
  paidThisPeriod: number;
  pendingPayments: number;
  errorPayments: number;
  primaryDocCompletion: number;
  vatSavings: number;
}

// Export format type
export type ExportFormat = 'CSV' | 'JSON' | 'EXCEL';
