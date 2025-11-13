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
          name: string
          type: 'developer' | 'agency' | 'agent' | 'ip' | 'npd'
          inn: string
          kpp: string | null
          tax_regime: 'VAT' | 'USN' | 'NPD'
          vat_rate: number | null
          account_number: string
          bik: string
          bank_name: string
          address: string
          offer_accepted: boolean
          offer_accepted_at: string | null
          offer_acceptance_channel: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'developer' | 'agency' | 'agent' | 'ip' | 'npd'
          inn: string
          kpp?: string | null
          tax_regime: 'VAT' | 'USN' | 'NPD'
          vat_rate?: number | null
          account_number: string
          bik: string
          bank_name: string
          address: string
          offer_accepted?: boolean
          offer_accepted_at?: string | null
          offer_acceptance_channel?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'developer' | 'agency' | 'agent' | 'ip' | 'npd'
          inn?: string
          kpp?: string | null
          tax_regime?: 'VAT' | 'USN' | 'NPD'
          vat_rate?: number | null
          account_number?: string
          bik?: string
          bank_name?: string
          address?: string
          offer_accepted?: boolean
          offer_accepted_at?: string | null
          offer_acceptance_channel?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      deals: {
        Row: {
          id: string
          object_name: string
          object_address: string
          lot_number: string | null
          total_amount: number
          status: 'draft' | 'in_progress' | 'in_registry' | 'approved' | 'sent_to_bank' | 'paid' | 'partially_paid' | 'cancelled'
          developer_id: string
          contract_basis: string | null
          contract_number: string | null
          contract_date: string | null
          special_account_receipt_date: string | null
          responsible_user_id: string | null
          initiator_role: string
          initiator_party_id: string
          initiator_user_id: string
          initiator_timestamp: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          object_name: string
          object_address: string
          lot_number?: string | null
          total_amount: number
          status?: 'draft' | 'in_progress' | 'in_registry' | 'approved' | 'sent_to_bank' | 'paid' | 'partially_paid' | 'cancelled'
          developer_id: string
          contract_basis?: string | null
          contract_number?: string | null
          contract_date?: string | null
          special_account_receipt_date?: string | null
          responsible_user_id?: string | null
          initiator_role: string
          initiator_party_id: string
          initiator_user_id: string
          initiator_timestamp?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          object_name?: string
          object_address?: string
          lot_number?: string | null
          total_amount?: number
          status?: 'draft' | 'in_progress' | 'in_registry' | 'approved' | 'sent_to_bank' | 'paid' | 'partially_paid' | 'cancelled'
          developer_id?: string
          contract_basis?: string | null
          contract_number?: string | null
          contract_date?: string | null
          special_account_receipt_date?: string | null
          responsible_user_id?: string | null
          initiator_role?: string
          initiator_party_id?: string
          initiator_user_id?: string
          initiator_timestamp?: string
          created_at?: string
          updated_at?: string
        }
      }
      deal_participants: {
        Row: {
          id: string
          deal_id: string
          counterparty_id: string
          role: 'agency' | 'agent' | 'ip' | 'npd'
          share_percent: number
          amount: number
          tax_regime: 'VAT' | 'USN' | 'NPD'
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
          role: 'agency' | 'agent' | 'ip' | 'npd'
          share_percent: number
          amount: number
          tax_regime: 'VAT' | 'USN' | 'NPD'
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
          role?: 'agency' | 'agent' | 'ip' | 'npd'
          share_percent?: number
          amount?: number
          tax_regime?: 'VAT' | 'USN' | 'NPD'
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
          date: string
          status: 'draft' | 'pending_approval' | 'approved' | 'sent_to_bank' | 'executed' | 'partially_executed' | 'error'
          total_amount: number
          lines_count: number
          creator_id: string
          approver_id: string | null
          approved_at: string | null
          sent_to_bank_at: string | null
          executed_at: string | null
          rejection_comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          registry_number: string
          date: string
          status?: 'draft' | 'pending_approval' | 'approved' | 'sent_to_bank' | 'executed' | 'partially_executed' | 'error'
          total_amount: number
          lines_count?: number
          creator_id: string
          approver_id?: string | null
          approved_at?: string | null
          sent_to_bank_at?: string | null
          executed_at?: string | null
          rejection_comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          registry_number?: string
          date?: string
          status?: 'draft' | 'pending_approval' | 'approved' | 'sent_to_bank' | 'executed' | 'partially_executed' | 'error'
          total_amount?: number
          lines_count?: number
          creator_id?: string
          approver_id?: string | null
          approved_at?: string | null
          sent_to_bank_at?: string | null
          executed_at?: string | null
          rejection_comment?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      registry_items: {
        Row: {
          id: string
          registry_id: string
          counterparty_id: string
          role: 'agency' | 'agent' | 'ip' | 'npd'
          inn: string
          account_number: string
          bik: string
          amount: number
          tax_regime: 'VAT' | 'USN' | 'NPD'
          vat_rate: number | null
          contract_number: string | null
          contract_date: string | null
          comment: string | null
          payment_status: 'pending' | 'accepted_by_bank' | 'executed' | 'error'
          bank_error_code: string | null
          bank_error_text: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          registry_id: string
          counterparty_id: string
          role: 'agency' | 'agent' | 'ip' | 'npd'
          inn: string
          account_number: string
          bik: string
          amount: number
          tax_regime: 'VAT' | 'USN' | 'NPD'
          vat_rate?: number | null
          contract_number?: string | null
          contract_date?: string | null
          comment?: string | null
          payment_status?: 'pending' | 'accepted_by_bank' | 'executed' | 'error'
          bank_error_code?: string | null
          bank_error_text?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          registry_id?: string
          counterparty_id?: string
          role?: 'agency' | 'agent' | 'ip' | 'npd'
          inn?: string
          account_number?: string
          bik?: string
          amount?: number
          tax_regime?: 'VAT' | 'USN' | 'NPD'
          vat_rate?: number | null
          contract_number?: string | null
          contract_date?: string | null
          comment?: string | null
          payment_status?: 'pending' | 'accepted_by_bank' | 'executed' | 'error'
          bank_error_code?: string | null
          bank_error_text?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          registry_id: string
          registry_item_id: string
          counterparty_id: string
          amount: number
          status: 'pending' | 'accepted_by_bank' | 'executed' | 'error'
          bank_reference: string | null
          bank_error_code: string | null
          bank_error_text: string | null
          executed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          registry_id: string
          registry_item_id: string
          counterparty_id: string
          amount: number
          status?: 'pending' | 'accepted_by_bank' | 'executed' | 'error'
          bank_reference?: string | null
          bank_error_code?: string | null
          bank_error_text?: string | null
          executed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          registry_id?: string
          registry_item_id?: string
          counterparty_id?: string
          amount?: number
          status?: 'pending' | 'accepted_by_bank' | 'executed' | 'error'
          bank_reference?: string | null
          bank_error_code?: string | null
          bank_error_text?: string | null
          executed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          payment_id: string
          counterparty_id: string
          document_type: 'act' | 'invoice' | 'npd_receipt'
          document_number: string
          document_date: string
          amount: number
          vat_amount: number | null
          file_url: string | null
          status: 'not_requested' | 'requested' | 'uploaded' | 'verified' | 'rejected'
          rejection_reason: string | null
          uploaded_at: string | null
          verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          payment_id: string
          counterparty_id: string
          document_type: 'act' | 'invoice' | 'npd_receipt'
          document_number: string
          document_date: string
          amount: number
          vat_amount?: number | null
          file_url?: string | null
          status?: 'not_requested' | 'requested' | 'uploaded' | 'verified' | 'rejected'
          rejection_reason?: string | null
          uploaded_at?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          payment_id?: string
          counterparty_id?: string
          document_type?: 'act' | 'invoice' | 'npd_receipt'
          document_number?: string
          document_date?: string
          amount?: number
          vat_amount?: number | null
          file_url?: string | null
          status?: 'not_requested' | 'requested' | 'uploaded' | 'verified' | 'rejected'
          rejection_reason?: string | null
          uploaded_at?: string | null
          verified_at?: string | null
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
