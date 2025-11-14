import { supabase, getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { Tariff, Segment, ObjectCategory, PaymentStage } from '@/types';

// Mock tariffs for development without Supabase
// Universal tariff applies to all developers and projects as fallback
const mockTariffs: Tariff[] = [
  // Universal tariff for all developers (fallback)
  {
    id: 'tariff-universal',
    tariffId: 'TAR-UNIVERSAL-BASE',
    developerId: '', // Applies to all
    developerName: 'Все застройщики',
    developerLegalEntity: 'М2 (универсальный тариф)',
    projectId: '', // Applies to all projects
    projectName: 'Все проекты',
    region: 'Москва',
    city: 'Москва',
    segment: 'FLATS',
    objectCategory: '1_ROOM', // Default category for display
    paymentStage: 'ADVANCE',
    commissionSchemeType: 'PERCENT_OF_CONTRACT',
    commissionTotalPercent: 2.5, // Base rate for unique client
    promoFlag: 'BASE',
    validFrom: new Date('2025-01-01'),
    validTo: new Date('2025-12-31'),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Specific tariff for Группа «Самолет»
  {
    id: 'tariff-samolot',
    tariffId: 'TAR-SAMOLET-BASE',
    developerId: 'dev-samolot',
    developerName: 'Группа «Самолет»',
    developerLegalEntity: 'ООО «Самолет»',
    projectId: 'prj-kvartal-domashniy',
    projectName: 'ЖК «Квартал Домашний»',
    region: 'Москва',
    city: 'Москва',
    segment: 'FLATS',
    objectCategory: '1_ROOM',
    paymentStage: 'ADVANCE',
    commissionSchemeType: 'PERCENT_OF_CONTRACT',
    commissionTotalPercent: 2.7, // Higher rate for Samolet
    promoFlag: 'BASE',
    validFrom: new Date('2025-01-01'),
    validTo: new Date('2025-11-30'),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Level Group tariff
  {
    id: 'tariff-level',
    tariffId: 'TAR-LEVEL-BASE',
    developerId: 'dev-level',
    developerName: 'Level Group',
    developerLegalEntity: 'ООО «Level Group»',
    projectId: '', // All Level Group projects
    projectName: 'Все проекты Level Group',
    region: 'Москва',
    city: 'Москва',
    segment: 'FLATS',
    objectCategory: '1_ROOM',
    paymentStage: 'ADVANCE',
    commissionSchemeType: 'PERCENT_OF_CONTRACT',
    commissionTotalPercent: 3.0, // Premium rate
    promoFlag: 'BASE',
    validFrom: new Date('2025-01-01'),
    validTo: new Date('2025-12-31'),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

interface TariffFilters {
  developerId?: string;
  projectId?: string;
  segment?: Segment;
  objectCategory?: ObjectCategory;
  paymentStage?: PaymentStage;
  isActive?: boolean;
}

class TariffsService {
  /**
   * Get all tariffs with optional filters
   */
  async getTariffs(filters?: TariffFilters): Promise<Tariff[]> {
    if (!isSupabaseConfigured()) {
      console.log('Using mock tariffs');
      return mockTariffs.filter(t => {
        // Universal tariff (undefined developerId/projectId) matches any filter
        if (filters?.developerId && t.developerId && t.developerId !== filters.developerId) return false;
        if (filters?.projectId && t.projectId && t.projectId !== filters.projectId) return false;
        if (filters?.segment && t.segment && t.segment !== filters.segment) return false;
        if (filters?.objectCategory && t.objectCategory && t.objectCategory !== filters.objectCategory) return false;
        if (filters?.paymentStage && t.paymentStage && t.paymentStage !== filters.paymentStage) return false;
        if (filters?.isActive !== undefined && t.isActive !== filters.isActive) return false;
        return true;
      });
    }

    let query = supabase
      .from('tariffs')
      .select('*')
      .order('valid_from', { ascending: false });

    if (filters?.developerId) {
      query = query.eq('developer_id', filters.developerId);
    }
    if (filters?.projectId) {
      query = query.eq('project_id', filters.projectId);
    }
    if (filters?.segment) {
      query = query.eq('segment', filters.segment);
    }
    if (filters?.objectCategory) {
      query = query.eq('object_category', filters.objectCategory);
    }
    if (filters?.paymentStage) {
      query = query.eq('payment_stage', filters.paymentStage);
    }
    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching tariffs:', error);
      throw error;
    }

    return this.mapToTariffs(data || []);
  }

  /**
   * Get a specific tariff by ID
   */
  async getTariff(id: string): Promise<Tariff | null> {
    if (!isSupabaseConfigured()) {
      return mockTariffs.find(t => t.id === id) || null;
    }

    const { data, error } = await supabase
      .from('tariffs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching tariff:', error);
      return null;
    }

    return data ? this.mapToTariff(data) : null;
  }

  /**
   * Find the best matching tariff for a deal
   * Returns the tariff with highest commission (максимальный тариф)
   */
  async findBestTariff(params: {
    developerId?: string;
    projectId: string;
    segment?: Segment;
    objectCategory?: ObjectCategory;
  }): Promise<Tariff | null> {
    const filters: TariffFilters = {
      projectId: params.projectId,
      isActive: true,
    };

    if (params.developerId) {
      filters.developerId = params.developerId;
    }
    if (params.segment) {
      filters.segment = params.segment;
    }
    if (params.objectCategory) {
      filters.objectCategory = params.objectCategory;
    }

    const tariffs = await this.getTariffs(filters);

    if (tariffs.length === 0) {
      return null;
    }

    // Return tariff with highest commission rate (максимальный тариф)
    const sortedByCommission = tariffs.sort((a, b) => {
      const rateA = a.commissionTotalPercent || 0;
      const rateB = b.commissionTotalPercent || 0;
      return rateB - rateA;
    });

    return sortedByCommission[0];
  }

  /**
   * Calculate commission amount based on tariff
   * Assumes unique client (уникальный клиент)
   */
  calculateCommission(totalAmount: number, tariff: Tariff): number {
    if (tariff.commissionSchemeType === 'PERCENT_OF_CONTRACT') {
      const percent = tariff.commissionTotalPercent || 0;
      let commission = (totalAmount * percent) / 100;

      // Apply min/max constraints if defined
      if (tariff.commissionMinAmount && commission < tariff.commissionMinAmount) {
        commission = tariff.commissionMinAmount;
      }
      if (tariff.commissionMaxAmount && commission > tariff.commissionMaxAmount) {
        commission = tariff.commissionMaxAmount;
      }

      return commission;
    }

    if (tariff.commissionSchemeType === 'FIXED_AMOUNT') {
      return tariff.commissionFixedAmount || 0;
    }

    // For STEP_SCALE, would need additional logic
    return 0;
  }

  /**
   * Get tariff display info
   */
  getTariffDisplayInfo(tariff: Tariff): string {
    if (tariff.commissionSchemeType === 'PERCENT_OF_CONTRACT') {
      return `${tariff.commissionTotalPercent}% (максимальный тариф)`;
    }
    if (tariff.commissionSchemeType === 'FIXED_AMOUNT') {
      return `${tariff.commissionFixedAmount} ₽ (фикс.)`;
    }
    return 'Ступенчатая шкала';
  }

  // Helper to map database records to Tariff objects
  private mapToTariff(data: any): Tariff {
    return {
      id: data.id,
      tariffId: data.tariff_id,
      developerId: data.developer_id,
      developerName: data.developer_name,
      developerLegalEntity: data.developer_legal_entity,
      projectId: data.project_id,
      projectName: data.project_name,
      region: data.region,
      city: data.city,
      segment: data.segment,
      objectCategory: data.object_category,
      paymentStage: data.payment_stage,
      commissionSchemeType: data.commission_scheme_type,
      commissionTotalPercent: data.commission_total_percent,
      commissionFixedAmount: data.commission_fixed_amount,
      commissionMinAmount: data.commission_min_amount,
      commissionMaxAmount: data.commission_max_amount,
      promoFlag: data.promo_flag,
      promoDescription: data.promo_description,
      validFrom: new Date(data.valid_from),
      validTo: data.valid_to ? new Date(data.valid_to) : undefined,
      isActive: data.is_active,
      comments: data.comments,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapToTariffs(data: any[]): Tariff[] {
    return data.map(d => this.mapToTariff(d));
  }
}

export const tariffsService = new TariffsService();
