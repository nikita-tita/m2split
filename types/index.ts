// User roles (extended)
export type UserRole =
  | 'DEVELOPER_ADMIN'     // Застройщик-Админ
  | 'M2_OPERATOR'         // М2-Оператор
  | 'AGENCY_ADMIN'        // АН-Админ
  | 'CONTRACTOR'          // Агент/ИП/НПД
  | 'ACCOUNTANT'          // Бухгалтер/Юрист застройщика
  | 'BANK_INTEGRATION';   // Банк (системная интеграция)

// Tax regimes
export type TaxRegime = 'VAT' | 'USN' | 'NPD';

// VAT rates
export type VATRate = 0 | 10 | 20 | 22;

// Contractor roles
export type ContractorRole = 'AGENCY' | 'AGENT' | 'IP' | 'NPD';

// Deal statuses (extended with APPROVED and IN_PROGRESS)
export type DealStatus = 'DRAFT' | 'IN_PROGRESS' | 'IN_REGISTRY' | 'APPROVED' | 'SENT_TO_BANK' | 'PAID' | 'PARTIALLY_PAID' | 'CANCELLED';

// Registry statuses
export type RegistryStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'SENT_TO_BANK' | 'EXECUTED' | 'PARTIALLY_EXECUTED' | 'ERROR';

// Payment statuses
export type PaymentStatus = 'PENDING' | 'ACCEPTED_BY_BANK' | 'EXECUTED' | 'ERROR';

// Primary document statuses
export type PrimaryDocStatus = 'NOT_REQUESTED' | 'REQUESTED' | 'UPLOADED' | 'VERIFIED' | 'REJECTED';

// User interface (extended with emulation)
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  partyId?: string; // Organization ID
  canEmulateRoles?: boolean; // QA/Admin flag
  createdAt: Date;
}

// Role emulation state
export interface RoleEmulation {
  isEmulating: boolean;
  realUserId?: string;
  realRole?: UserRole;
  actedAsRole?: UserRole;
  actedAsPartyId?: string;
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

// Deal initiator (immutable)
export interface DealInitiator {
  role: UserRole;
  partyId: string;
  userId: string;
  timestamp: Date;
}

// Deal interface (extended with initiator)
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

  // Initiator (immutable, read-only)
  initiator: DealInitiator;

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

// Audit log interface (extended with emulation tracking)
export interface AuditLog {
  id: string;
  timestamp: Date;

  // Real user
  performedByUserId: string;
  performedByRole: UserRole;

  // Emulation (if any)
  actedAsRole?: UserRole;
  actedAsPartyId?: string;
  emulatedByUserId?: string;

  // Action
  entityType: 'DEAL' | 'REGISTRY' | 'PAYMENT' | 'CONTRACTOR' | 'DOCUMENT';
  entityId: string;
  action: string;

  // Changes
  before?: Record<string, any>;
  after?: Record<string, any>;

  // Context
  source: 'UI' | 'API';
  ipAddress: string;
  userAgent?: string;

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
