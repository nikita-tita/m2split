import { supabase, isSupabaseConfigured } from '../supabase';
import { mockContractors } from '../mock-data';
import type { Contractor } from '@/types';
import type { Database } from '../database.types';

type CounterpartyRow = Database['public']['Tables']['counterparties']['Row'];
type CounterpartyInsert = Database['public']['Tables']['counterparties']['Insert'];
type CounterpartyUpdate = Database['public']['Tables']['counterparties']['Update'];

export class CounterpartiesService {
  /**
   * Get all counterparties with optional filters
   */
  async getCounterparties(filters?: {
    type?: string;
    offerAccepted?: boolean;
  }): Promise<Contractor[]> {
    // Fallback to mock data if Supabase not configured
    if (!isSupabaseConfigured() || !supabase) {
      console.log('📦 Using mock counterparties data');
      let result = [...mockContractors];

      if (filters?.offerAccepted !== undefined) {
        result = result.filter(c => !!c.offerAcceptedAt === filters.offerAccepted);
      }

      return result;
    }

    try {
      let query = supabase.from('counterparties').select('*');

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }

      if (filters?.offerAccepted !== undefined) {
        query = query.eq('offer_accepted', filters.offerAccepted);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Map database rows to Contractor type
      return (data || []).map(this.mapToContractor);
    } catch (error) {
      console.error('Error fetching counterparties:', error);
      return mockContractors;
    }
  }

  /**
   * Get counterparty by ID
   */
  async getCounterparty(id: string): Promise<Contractor | null> {
    if (!isSupabaseConfigured() || !supabase) {
      return mockContractors.find(c => c.id === id) || null;
    }

    try {
      const { data, error } = await supabase
        .from('counterparties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data ? this.mapToContractor(data) : null;
    } catch (error) {
      console.error('Error fetching counterparty:', error);
      return mockContractors.find(c => c.id === id) || null;
    }
  }

  /**
   * Create new counterparty
   */
  async createCounterparty(data: CounterpartyInsert): Promise<Contractor> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase not configured. Cannot create counterparty.');
    }

    try {
      const { data: created, error } = await supabase
        .from('counterparties')
        .insert(data as any)
        .select()
        .single();

      if (error) throw error;

      return this.mapToContractor(created as CounterpartyRow);
    } catch (error) {
      console.error('Error creating counterparty:', error);
      throw error;
    }
  }

  /**
   * Update counterparty
   */
  async updateCounterparty(id: string, updates: CounterpartyUpdate): Promise<Contractor> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase not configured. Cannot update counterparty.');
    }

    try {
      const { data: updated, error } = await supabase
        .from('counterparties')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return this.mapToContractor(updated as CounterpartyRow);
    } catch (error) {
      console.error('Error updating counterparty:', error);
      throw error;
    }
  }

  /**
   * Accept offer for counterparty
   */
  async acceptOffer(id: string, channel: string = 'UI'): Promise<Contractor> {
    return this.updateCounterparty(id, {
      offer_accepted: true,
      offer_accepted_at: new Date().toISOString(),
      offer_acceptance_channel: channel,
    });
  }

  /**
   * Map database row to Contractor type
   */
  private mapToContractor(row: CounterpartyRow): Contractor {
    return {
      id: row.id,
      name: row.name,
      inn: row.inn,
      kpp: row.kpp || undefined,
      accountNumber: row.account_number,
      bik: row.bik,
      bankName: row.bank_name,
      address: row.address,
      taxRegime: row.tax_regime as 'VAT' | 'USN' | 'NPD',
      role: this.mapTypeToRole(row.type),
      offerAcceptedAt: row.offer_accepted_at ? new Date(row.offer_accepted_at) : undefined,
      offerAcceptanceChannel: row.offer_acceptance_channel || undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  /**
   * Map database type to ContractorRole
   */
  private mapTypeToRole(type: string): 'AGENCY' | 'AGENT' | 'IP' | 'NPD' {
    const map: Record<string, 'AGENCY' | 'AGENT' | 'IP' | 'NPD'> = {
      agency: 'AGENCY',
      agent: 'AGENT',
      ip: 'IP',
      npd: 'NPD',
    };
    return map[type] || 'AGENT';
  }
}

export const counterpartiesService = new CounterpartiesService();
