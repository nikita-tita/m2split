import { supabase, isSupabaseConfigured } from '../supabase';
import { Contractor } from '@/types';
import { mockContractors } from '../mock-data';

export interface CreateCounterpartyInput {
  type: 'DEVELOPER' | 'AGENCY' | 'AGENT' | 'IP' | 'NPD';
  name: string;
  inn: string;
  kpp?: string;
  accountNumber?: string;
  bik?: string;
  bankName?: string;
  email?: string;
  phone?: string;
}

class CounterpartiesService {
  /**
   * Get all counterparties
   */
  async getCounterparties(filters?: {
    type?: string;
    offerAccepted?: boolean;
  }): Promise<Contractor[]> {
    if (!isSupabaseConfigured()) {
      console.warn('📦 Using mock data (Supabase not configured)');
      return mockContractors;
    }

    try {
      let query = supabase
        .from('counterparties')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.offerAccepted !== undefined) {
        if (filters.offerAccepted) {
          query = query.not('offer_accepted_at', 'is', null);
        } else {
          query = query.is('offer_accepted_at', null);
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(this.transformFromDB);
    } catch (error) {
      console.error('Error fetching counterparties:', error);
      throw error;
    }
  }

  /**
   * Get single counterparty
   */
  async getCounterparty(id: string): Promise<Contractor | null> {
    if (!isSupabaseConfigured()) {
      return mockContractors.find(c => c.id === id) || null;
    }

    try {
      const { data, error } = await supabase
        .from('counterparties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return this.transformFromDB(data);
    } catch (error) {
      console.error('Error fetching counterparty:', error);
      return null;
    }
  }

  /**
   * Create new counterparty
   */
  async createCounterparty(input: CreateCounterpartyInput): Promise<Contractor> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }

    try {
      const { data, error } = await supabase
        .from('counterparties')
        .insert({
          type: input.type,
          name: input.name,
          inn: input.inn,
          kpp: input.kpp,
          account_number: input.accountNumber,
          bik: input.bik,
          bank_name: input.bankName,
          email: input.email,
          phone: input.phone,
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create counterparty');

      return this.transformFromDB(data);
    } catch (error) {
      console.error('Error creating counterparty:', error);
      throw error;
    }
  }

  /**
   * Update counterparty
   */
  async updateCounterparty(id: string, input: Partial<CreateCounterpartyInput>): Promise<Contractor> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }

    try {
      const { data, error } = await supabase
        .from('counterparties')
        .update({
          type: input.type,
          name: input.name,
          inn: input.inn,
          kpp: input.kpp,
          account_number: input.accountNumber,
          bik: input.bik,
          bank_name: input.bankName,
          email: input.email,
          phone: input.phone,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Counterparty not found');

      return this.transformFromDB(data);
    } catch (error) {
      console.error('Error updating counterparty:', error);
      throw error;
    }
  }

  /**
   * Accept offer for counterparty
   */
  async acceptOffer(id: string): Promise<Contractor> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }

    try {
      const { data, error } = await supabase
        .from('counterparties')
        .update({ offer_accepted_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Counterparty not found');

      return this.transformFromDB(data);
    } catch (error) {
      console.error('Error accepting offer:', error);
      throw error;
    }
  }

  /**
   * Transform Supabase data to Contractor type
   */
  private transformFromDB(data: any): Contractor {
    return {
      id: data.id,
      name: data.name,
      inn: data.inn,
      type: data.type as 'DEVELOPER' | 'AGENCY' | 'AGENT' | 'IP' | 'NPD',
      kpp: data.kpp,
      accountNumber: data.account_number,
      bik: data.bik,
      bankName: data.bank_name,
      email: data.email,
      phone: data.phone,
      offerAcceptedAt: data.offer_accepted_at ? new Date(data.offer_accepted_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}

export const counterpartiesService = new CounterpartiesService();
