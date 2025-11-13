import { supabase, isSupabaseConfigured } from '../supabase';
import { mockDeals } from '../mock-data';
import type { Deal, DealShare } from '@/types';
import type { Database } from '../database.types';

type DealRow = Database['public']['Tables']['deals']['Row'];
type DealInsert = Database['public']['Tables']['deals']['Insert'];
type DealUpdate = Database['public']['Tables']['deals']['Update'];
type ParticipantInsert = Database['public']['Tables']['deal_participants']['Insert'];

interface CreateDealInput {
  objectName: string;
  objectAddress: string;
  lotNumber?: string;
  totalAmount: number;
  developerId: string;
  shares: Array<{
    counterpartyId: string;
    role: 'AGENCY' | 'AGENT' | 'IP' | 'NPD';
    sharePercent: number;
    amount: number;
    taxRegime: 'VAT' | 'USN' | 'NPD';
    vatRate?: number;
    contractNumber?: string;
    contractDate?: Date;
  }>;
  contractBasis?: string;
  contractNumber?: string;
  contractDate?: Date;
  initiatorRole: string;
  initiatorPartyId: string;
  initiatorUserId: string;
}

export class DealsService {
  /**
   * Get all deals with optional filters
   */
  async getDeals(filters?: {
    status?: string;
    developerId?: string;
  }): Promise<Deal[]> {
    // Fallback to mock data if Supabase not configured
    if (!isSupabaseConfigured() || !supabase) {
      console.log('📦 Using mock deals data');
      let result = [...mockDeals];

      if (filters?.status) {
        result = result.filter(d => d.status === filters.status);
      }

      return result;
    }

    try {
      let query = supabase
        .from('deals')
        .select(`
          *,
          deal_participants (
            *,
            counterparties (*)
          )
        `);

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.developerId) {
        query = query.eq('developer_id', filters.developerId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Map database rows to Deal type
      return (data || []).map(this.mapToDeal);
    } catch (error) {
      console.error('Error fetching deals:', error);
      return mockDeals;
    }
  }

  /**
   * Get deal by ID with participants
   */
  async getDeal(id: string): Promise<Deal | null> {
    if (!isSupabaseConfigured() || !supabase) {
      return mockDeals.find(d => d.id === id) || null;
    }

    try {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          deal_participants (
            *,
            counterparties (*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return data ? this.mapToDeal(data) : null;
    } catch (error) {
      console.error('Error fetching deal:', error);
      return mockDeals.find(d => d.id === id) || null;
    }
  }

  /**
   * Create new deal with participants
   */
  async createDeal(input: CreateDealInput): Promise<Deal> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase not configured. Cannot create deal.');
    }

    // Validate shares sum to 100%
    const totalShares = input.shares.reduce((sum, s) => sum + s.sharePercent, 0);
    if (Math.abs(totalShares - 100) > 0.01) {
      throw new Error(`Shares must sum to 100% (got ${totalShares}%)`);
    }

    try {
      // Create deal
      const dealData: DealInsert = {
        object_name: input.objectName,
        object_address: input.objectAddress,
        lot_number: input.lotNumber,
        total_amount: input.totalAmount,
        developer_id: input.developerId,
        contract_basis: input.contractBasis,
        contract_number: input.contractNumber,
        contract_date: input.contractDate?.toISOString().split('T')[0],
        initiator_role: input.initiatorRole,
        initiator_party_id: input.initiatorPartyId,
        initiator_user_id: input.initiatorUserId,
        status: 'draft',
      };

      const { data: createdDeal, error: dealError } = await supabase
        .from('deals')
        .insert(dealData as any)
        .select()
        .single();

      if (dealError) throw dealError;

      // Create participants
      const participants: ParticipantInsert[] = input.shares.map(share => ({
        deal_id: createdDeal.id,
        counterparty_id: share.counterpartyId,
        role: share.role.toLowerCase() as 'agency' | 'agent' | 'ip' | 'npd',
        share_percent: share.sharePercent,
        amount: share.amount,
        tax_regime: share.taxRegime,
        vat_rate: share.vatRate,
        contract_number: share.contractNumber,
        contract_date: share.contractDate?.toISOString().split('T')[0],
      }));

      const { error: participantsError } = await supabase
        .from('deal_participants')
        .insert(participants as any);

      if (participantsError) throw participantsError;

      // Fetch complete deal with participants
      const deal = await this.getDeal(createdDeal.id);
      if (!deal) throw new Error('Failed to fetch created deal');

      return deal;
    } catch (error) {
      console.error('Error creating deal:', error);
      throw error;
    }
  }

  /**
   * Update deal
   */
  async updateDeal(id: string, updates: Partial<DealUpdate>): Promise<Deal> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase not configured. Cannot update deal.');
    }

    try {
      const { error } = await supabase
        .from('deals')
        .update(updates as any)
        .eq('id', id);

      if (error) throw error;

      const deal = await this.getDeal(id);
      if (!deal) throw new Error('Deal not found after update');

      return deal;
    } catch (error) {
      console.error('Error updating deal:', error);
      throw error;
    }
  }

  /**
   * Map database row to Deal type
   */
  private mapToDeal(row: any): Deal {
    return {
      id: row.id,
      objectName: row.object_name,
      objectAddress: row.object_address,
      lotNumber: row.lot_number || undefined,
      developerId: row.developer_id,
      totalAmount: row.total_amount,
      status: row.status,
      shares: (row.deal_participants || []).map((p: any) => this.mapToShare(p)),
      contractBasis: row.contract_basis || undefined,
      contractNumber: row.contract_number || undefined,
      contractDate: row.contract_date ? new Date(row.contract_date) : undefined,
      specialAccountReceiptDate: row.special_account_receipt_date
        ? new Date(row.special_account_receipt_date)
        : undefined,
      responsibleUserId: row.responsible_user_id || undefined,
      initiator: {
        role: row.initiator_role,
        partyId: row.initiator_party_id,
        userId: row.initiator_user_id,
        timestamp: new Date(row.initiator_timestamp),
      },
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  /**
   * Map participant to DealShare
   */
  private mapToShare(participant: any): DealShare {
    return {
      id: participant.id,
      contractorId: participant.counterparty_id,
      contractor: participant.counterparties ? {
        id: participant.counterparties.id,
        name: participant.counterparties.name,
        inn: participant.counterparties.inn,
        kpp: participant.counterparties.kpp,
        accountNumber: participant.counterparties.account_number,
        bik: participant.counterparties.bik,
        bankName: participant.counterparties.bank_name,
        address: participant.counterparties.address,
        taxRegime: participant.counterparties.tax_regime,
        role: participant.role.toUpperCase(),
        createdAt: new Date(participant.counterparties.created_at),
        updatedAt: new Date(participant.counterparties.updated_at),
      } : undefined,
      role: participant.role.toUpperCase() as 'AGENCY' | 'AGENT' | 'IP' | 'NPD',
      sharePercent: participant.share_percent,
      amount: participant.amount,
      taxRegime: participant.tax_regime as 'VAT' | 'USN' | 'NPD',
      vatRate: participant.vat_rate || undefined,
      contractNumber: participant.contract_number || undefined,
      contractDate: participant.contract_date ? new Date(participant.contract_date) : undefined,
    };
  }
}

export const dealsService = new DealsService();
