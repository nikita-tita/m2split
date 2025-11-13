export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      counterparties: {
        Row: {
          id: string
          type: 'DEVELOPER' | 'AGENCY' | 'AGENT' | 'IP' | 'NPD'
          name: string
          inn: string
          kpp: string | null
          account_number: string | null
          bik: string | null
          bank_name: string | null
          email: string | null
          phone: string | null
          offer_accepted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: 'DEVELOPER' | 'AGENCY' | 'AGENT' | 'IP' | 'NPD'
          name: string
          inn: string
          kpp?: string | null
          account_number?: string | null
          bik?: string | null
          bank_name?: string | null
          email?: string | null
          phone?: string | null
          offer_accepted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: 'DEVELOPER' | 'AGENCY' | 'AGENT' | 'IP' | 'NPD'
          name?: string
          inn?: string
          kpp?: string | null
          account_number?: string | null
          bik?: string | null
          bank_name?: string | null
          email?: string | null
          phone?: string | null
          offer_accepted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      deals: {
        Row: {
          id: string
          deal_number: string | null
          object_name: string
          object_address: string
          lot_number: string | null
          developer_id: string | null
          agency_id: string | null
          total_amount: number
          commission_amount: number
          contract_number: string | null
          contract_date: string | null
          special_account_receipt_date: string | null
          status: 'draft' | 'ready_for_registry' | 'in_registry' | 'closed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          deal_number?: string | null
          object_name: string
          object_address: string
          lot_number?: string | null
          developer_id?: string | null
          agency_id?: string | null
          total_amount: number
          commission_amount: number
          contract_number?: string | null
          contract_date?: string | null
          special_account_receipt_date?: string | null
          status?: 'draft' | 'ready_for_registry' | 'in_registry' | 'closed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          deal_number?: string | null
          object_name?: string
          object_address?: string
          lot_number?: string | null
          developer_id?: string | null
          agency_id?: string | null
          total_amount?: number
          commission_amount?: number
          contract_number?: string | null
          contract_date?: string | null
          special_account_receipt_date?: string | null
          status?: 'draft' | 'ready_for_registry' | 'in_registry' | 'closed'
          created_at?: string
          updated_at?: string
        }
      }
      deal_participants: {
        Row: {
          id: string
          deal_id: string
          counterparty_id: string
          role: 'AGENCY' | 'AGENT' | 'IP' | 'NPD'
          share_percent: number
          amount: number
          tax_regime: 'OSN' | 'USN' | 'NPD'
          vat_rate: number | null
          contract_number: string | null
          contract_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          deal_id: string
          counterparty_id: string
          role: 'AGENCY' | 'AGENT' | 'IP' | 'NPD'
          share_percent: number
          amount: number
          tax_regime: 'OSN' | 'USN' | 'NPD'
          vat_rate?: number | null
          contract_number?: string | null
          contract_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          deal_id?: string
          counterparty_id?: string
          role?: 'AGENCY' | 'AGENT' | 'IP' | 'NPD'
          share_percent?: number
          amount?: number
          tax_regime?: 'OSN' | 'USN' | 'NPD'
          vat_rate?: number | null
          contract_number?: string | null
          contract_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      registries: {
        Row: {
          id: string
          registry_number: string
          type: 'DEVELOPER' | 'AGENCY' | 'M2_INTERNAL'
          sender_id: string | null
          date: string
          total_amount: number
          lines_count: number
          status: 'draft' | 'pending_approval' | 'approved' | 'sent_to_bank' | 'executed' | 'partially_executed' | 'error'
          approved_at: string | null
          sent_to_bank_at: string | null
          executed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          registry_number: string
          type: 'DEVELOPER' | 'AGENCY' | 'M2_INTERNAL'
          sender_id?: string | null
          date: string
          total_amount: number
          lines_count?: number
          status?: 'draft' | 'pending_approval' | 'approved' | 'sent_to_bank' | 'executed' | 'partially_executed' | 'error'
          approved_at?: string | null
          sent_to_bank_at?: string | null
          executed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          registry_number?: string
          type?: 'DEVELOPER' | 'AGENCY' | 'M2_INTERNAL'
          sender_id?: string | null
          date?: string
          total_amount?: number
          lines_count?: number
          status?: 'draft' | 'pending_approval' | 'approved' | 'sent_to_bank' | 'executed' | 'partially_executed' | 'error'
          approved_at?: string | null
          sent_to_bank_at?: string | null
          executed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      registry_items: {
        Row: {
          id: string
          registry_id: string
          deal_id: string | null
          deal_participant_id: string | null
          counterparty_id: string
          amount: number
          role: 'AGENCY' | 'AGENT' | 'IP' | 'NPD'
          tax_regime: 'OSN' | 'USN' | 'NPD'
          vat_rate: number | null
          inn: string
          account_number: string
          bik: string
          payment_status: 'pending' | 'accepted_by_bank' | 'executed' | 'error'
          bank_error_text: string | null
          comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          registry_id: string
          deal_id?: string | null
          deal_participant_id?: string | null
          counterparty_id: string
          amount: number
          role: 'AGENCY' | 'AGENT' | 'IP' | 'NPD'
          tax_regime: 'OSN' | 'USN' | 'NPD'
          vat_rate?: number | null
          inn: string
          account_number: string
          bik: string
          payment_status?: 'pending' | 'accepted_by_bank' | 'executed' | 'error'
          bank_error_text?: string | null
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          registry_id?: string
          deal_id?: string | null
          deal_participant_id?: string | null
          counterparty_id?: string
          amount?: number
          role?: 'AGENCY' | 'AGENT' | 'IP' | 'NPD'
          tax_regime?: 'OSN' | 'USN' | 'NPD'
          vat_rate?: number | null
          inn?: string
          account_number?: string
          bik?: string
          payment_status?: 'pending' | 'accepted_by_bank' | 'executed' | 'error'
          bank_error_text?: string | null
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          type: 'ACT' | 'INVOICE' | 'NPD_RECEIPT'
          deal_id: string | null
          registry_id: string | null
          deal_participant_id: string | null
          counterparty_id: string | null
          document_number: string | null
          document_date: string | null
          amount: number | null
          status: 'awaiting' | 'uploaded' | 'verified' | 'rejected'
          file_url: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: 'ACT' | 'INVOICE' | 'NPD_RECEIPT'
          deal_id?: string | null
          registry_id?: string | null
          deal_participant_id?: string | null
          counterparty_id?: string | null
          document_number?: string | null
          document_date?: string | null
          amount?: number | null
          status?: 'awaiting' | 'uploaded' | 'verified' | 'rejected'
          file_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: 'ACT' | 'INVOICE' | 'NPD_RECEIPT'
          deal_id?: string | null
          registry_id?: string | null
          deal_participant_id?: string | null
          counterparty_id?: string | null
          document_number?: string | null
          document_date?: string | null
          amount?: number | null
          status?: 'awaiting' | 'uploaded' | 'verified' | 'rejected'
          file_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
