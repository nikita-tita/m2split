import { supabase, isSupabaseConfigured } from '../supabase';
import { Registry, RegistryPaymentLine } from '@/types';
import { mockRegistries } from '../mock-data';
import { useStore } from '../store';

class RegistriesService {
  /**
   * Get all registries
   */
  async getRegistries(filters?: {
    status?: string;
    developerId?: string;
  }): Promise<Registry[]> {
    if (!isSupabaseConfigured()) {
      // Use Zustand store for client-side data
      const { registries } = useStore.getState();
      return registries.length > 0 ? registries : mockRegistries;
    }

    try {
      let query = supabase
        .from('registries')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.developerId) {
        query = query.eq('developer_id', filters.developerId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching registries:', error);
      throw error;
    }
  }

  /**
   * Get single registry by ID
   */
  async getRegistry(id: string): Promise<Registry | null> {
    if (!isSupabaseConfigured()) {
      // Use Zustand store for client-side data
      const { registries } = useStore.getState();
      const registry = registries.find(r => r.id === id);
      if (registry) return registry;

      // Fallback to mock data
      return mockRegistries.find(r => r.id === id) || null;
    }

    try {
      const { data, error } = await supabase
        .from('registries')
        .select(`
          *,
          registry_payment_lines(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching registry:', error);
      return null;
    }
  }

  /**
   * Create a new registry
   */
  async createRegistry(registry: Omit<Registry, 'id' | 'createdAt' | 'updatedAt'>): Promise<Registry> {
    if (!isSupabaseConfigured()) {
      const newRegistry: Registry = {
        ...registry,
        id: `r${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      useStore.getState().addRegistry(newRegistry);
      return newRegistry;
    }

    try {
      const { data, error } = await supabase
        .from('registries')
        .insert([{
          registry_number: registry.registryNumber,
          date: registry.date,
          status: registry.status,
          total_amount: registry.totalAmount,
          lines_count: registry.linesCount,
          creator_id: registry.creatorId,
        }])
        .select()
        .single();

      if (error) throw error;

      // Insert payment lines
      if (registry.lines && registry.lines.length > 0) {
        const linesData = registry.lines.map(line => ({
          registry_id: data.id,
          contractor_id: line.contractorId,
          role: line.role,
          inn: line.inn,
          account_number: line.accountNumber,
          bik: line.bik,
          amount: line.amount,
          tax_regime: line.taxRegime,
          vat_rate: line.vatRate,
          contract_number: line.contractNumber,
          contract_date: line.contractDate,
          comment: line.comment,
          payment_status: line.paymentStatus,
        }));

        await supabase.from('registry_payment_lines').insert(linesData);
      }

      return data as Registry;
    } catch (error) {
      console.error('Error creating registry:', error);
      throw error;
    }
  }

  /**
   * Update registry status
   */
  async updateRegistryStatus(id: string, status: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      const { updateRegistry } = useStore.getState();
      updateRegistry(id, { status: status as any });
      return;
    }

    try {
      const { error } = await supabase
        .from('registries')
        .update({ status, updated_at: new Date() })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating registry status:', error);
      throw error;
    }
  }

  /**
   * Update payment line status
   */
  async updatePaymentLineStatus(
    lineId: string,
    status: string,
    errorCode?: string,
    errorText?: string
  ): Promise<void> {
    if (!isSupabaseConfigured()) {
      // For now, just log - would need to update store structure to support this
      console.log('Update payment line status (mock):', lineId, status);
      return;
    }

    try {
      const { error } = await supabase
        .from('registry_payment_lines')
        .update({
          payment_status: status,
          bank_error_code: errorCode,
          bank_error_text: errorText,
          updated_at: new Date(),
        })
        .eq('id', lineId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating payment line status:', error);
      throw error;
    }
  }
}

export const registriesService = new RegistriesService();
