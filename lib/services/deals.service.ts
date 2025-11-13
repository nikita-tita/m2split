import { supabase, isSupabaseConfigured } from '../supabase';
import { Deal, DealShare, DealStatus, Contractor } from '@/types';
import { mockDeals, mockContractors } from '../mock-data';

export interface CreateDealInput {
  objectName: string;
  objectAddress: string;
  lotNumber?: string;
  developerId?: string;
  agencyId?: string;
  totalAmount: number;
  commissionAmount: number;
  contractNumber?: string;
  contractDate?: Date;
  shares: Array<{
    contractorId: string;
    role: 'AGENCY' | 'AGENT' | 'IP' | 'NPD';
    sharePercent: number;
    amount: number;
    taxRegime: 'OSN' | 'USN' | 'NPD';
    vatRate?: number;
    contractNumber?: string;
    contractDate?: Date;
  }>;
}

export interface UpdateDealInput extends Partial<CreateDealInput> {
  id: string;
  status?: DealStatus;
}

class DealsService {
  /**
   * Get all deals (with optional filters by role/contractor)
   */
  async getDeals(filters?: {
    status?: string;
    developerId?: string;
    agencyId?: string;
    contractorId?: string;
  }): Promise<Deal[]> {
    if (!isSupabaseConfigured()) {
      console.warn('📦 Using mock data (Supabase not configured)');
      return mockDeals;
    }

    try {
      let query = supabase
        .from('deals')
        .select(`
          *,
          developer:developer_id(id, name, inn),
          agency:agency_id(id, name, inn),
          deal_participants(
            id,
            role,
            share_percent,
            amount,
            tax_regime,
            vat_rate,
            contract_number,
            contract_date,
            counterparty:counterparty_id(id, name, inn, type, account_number, bik, bank_name)
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.developerId) {
        query = query.eq('developer_id', filters.developerId);
      }
      if (filters?.agencyId) {
        query = query.eq('agency_id', filters.agencyId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform Supabase data to Deal format
      return (data || []).map(this.transformDealFromDB);
    } catch (error) {
      console.error('Error fetching deals:', error);
      throw error;
    }
  }

  /**
   * Get single deal by ID
   */
  async getDeal(id: string): Promise<Deal | null> {
    if (!isSupabaseConfigured()) {
      return mockDeals.find(d => d.id === id) || null;
    }

    try {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          developer:developer_id(id, name, inn),
          agency:agency_id(id, name, inn),
          deal_participants(
            id,
            role,
            share_percent,
            amount,
            tax_regime,
            vat_rate,
            contract_number,
            contract_date,
            counterparty:counterparty_id(id, name, inn, type, account_number, bik, bank_name)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return this.transformDealFromDB(data);
    } catch (error) {
      console.error('Error fetching deal:', error);
      return null;
    }
  }

  /**
   * Create new deal
   */
  async createDeal(input: CreateDealInput): Promise<Deal> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured. Please set up Supabase to create deals.');
    }

    // Validate shares sum to 100%
    const totalPercent = input.shares.reduce((sum, s) => sum + s.sharePercent, 0);
    if (Math.abs(totalPercent - 100) > 0.01) {
      throw new Error(`Shares must sum to 100% (current: ${totalPercent}%)`);
    }

    try {
      // Generate deal number
      const dealNumber = `D-${Date.now()}`;

      // Create deal
      const { data: deal, error: dealError } = await supabase
        .from('deals')
        .insert({
          deal_number: dealNumber,
          object_name: input.objectName,
          object_address: input.objectAddress,
          lot_number: input.lotNumber,
          developer_id: input.developerId,
          agency_id: input.agencyId,
          total_amount: input.totalAmount,
          commission_amount: input.commissionAmount,
          contract_number: input.contractNumber,
          contract_date: input.contractDate?.toISOString().split('T')[0],
          status: 'draft',
        })
        .select()
        .single();

      if (dealError) throw dealError;
      if (!deal) throw new Error('Failed to create deal');

      // Create participants
      const participants = input.shares.map(share => ({
        deal_id: deal.id,
        counterparty_id: share.contractorId,
        role: share.role,
        share_percent: share.sharePercent,
        amount: share.amount,
        tax_regime: share.taxRegime,
        vat_rate: share.vatRate,
        contract_number: share.contractNumber,
        contract_date: share.contractDate?.toISOString().split('T')[0],
      }));

      const { error: participantsError } = await supabase
        .from('deal_participants')
        .insert(participants);

      if (participantsError) throw participantsError;

      // Fetch complete deal with participants
      const createdDeal = await this.getDeal(deal.id);
      if (!createdDeal) throw new Error('Failed to fetch created deal');

      return createdDeal;
    } catch (error) {
      console.error('Error creating deal:', error);
      throw error;
    }
  }

  /**
   * Update deal
   */
  async updateDeal(input: UpdateDealInput): Promise<Deal> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }

    try {
      const { data, error } = await supabase
        .from('deals')
        .update({
          object_name: input.objectName,
          object_address: input.objectAddress,
          lot_number: input.lotNumber,
          total_amount: input.totalAmount,
          commission_amount: input.commissionAmount,
          contract_number: input.contractNumber,
          contract_date: input.contractDate?.toISOString().split('T')[0],
          status: input.status,
        })
        .eq('id', input.id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Deal not found');

      const updatedDeal = await this.getDeal(input.id);
      if (!updatedDeal) throw new Error('Failed to fetch updated deal');

      return updatedDeal;
    } catch (error) {
      console.error('Error updating deal:', error);
      throw error;
    }
  }

  /**
   * Transform Supabase data to Deal type
   */
  private transformDealFromDB(data: any): Deal {
    return {
      id: data.id,
      dealNumber: data.deal_number || data.id,
      objectName: data.object_name,
      objectAddress: data.object_address,
      lotNumber: data.lot_number,
      totalAmount: parseFloat(data.total_amount || '0'),
      status: data.status as 'DRAFT' | 'IN_PROGRESS' | 'IN_REGISTRY' | 'PAID',
      contractNumber: data.contract_number,
      contractDate: data.contract_date ? new Date(data.contract_date) : undefined,
      specialAccountReceiptDate: data.special_account_receipt_date
        ? new Date(data.special_account_receipt_date)
        : undefined,
      createdAt: new Date(data.created_at),
      shares: (data.deal_participants || []).map((p: any) => ({
        id: p.id,
        role: p.role,
        sharePercent: parseFloat(p.share_percent || '0'),
        amount: parseFloat(p.amount || '0'),
        taxRegime: p.tax_regime,
        vatRate: p.vat_rate ? parseFloat(p.vat_rate) : undefined,
        contractNumber: p.contract_number,
        contractDate: p.contract_date ? new Date(p.contract_date) : undefined,
        contractor: p.counterparty ? {
          id: p.counterparty.id,
          name: p.counterparty.name,
          inn: p.counterparty.inn,
          type: p.counterparty.type,
          accountNumber: p.counterparty.account_number,
          bik: p.counterparty.bik,
          bankName: p.counterparty.bank_name,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Contractor : undefined,
      })) as DealShare[],
    };
  }
}

export const dealsService = new DealsService();
