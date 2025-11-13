import { supabase, isSupabaseConfigured } from '../supabase';
import { Project } from '@/types';

// Mock projects for fallback
const mockProjects: Project[] = [
  {
    id: 'prj-kvartal-domashniy',
    developerId: 'dev-samolot',
    projectName: 'ЖК «Квартал Домашний»',
    region: 'Москва',
    city: 'Москва',
    address: 'ул. Донецкая',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'prj-soyuz',
    developerId: 'dev-rodina',
    projectName: 'ЖК «СОЮЗ»',
    region: 'Москва',
    city: 'Москва',
    address: 'ул. Сельскохозяйственная',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

class ProjectsService {
  /**
   * Get all projects with optional filters
   */
  async getProjects(filters?: {
    developerId?: string;
    city?: string;
    isActive?: boolean;
  }): Promise<Project[]> {
    if (!isSupabaseConfigured()) {
      console.warn('📦 Using mock data (Supabase not configured)');
      return mockProjects;
    }

    try {
      let query = supabase
        .from('projects')
        .select('*')
        .order('project_name', { ascending: true });

      if (filters?.developerId) {
        query = query.eq('developer_id', filters.developerId);
      }
      if (filters?.city) {
        query = query.eq('city', filters.city);
      }
      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(this.transformFromDB);
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  /**
   * Get single project
   */
  async getProject(id: string): Promise<Project | null> {
    if (!isSupabaseConfigured()) {
      return mockProjects.find(p => p.id === id) || null;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return this.transformFromDB(data);
    } catch (error) {
      console.error('Error fetching project:', error);
      return null;
    }
  }

  /**
   * Transform Supabase data to Project type
   */
  private transformFromDB(data: any): Project {
    return {
      id: data.id,
      developerId: data.developer_id,
      projectName: data.project_name,
      region: data.region,
      city: data.city,
      address: data.address,
      description: data.description,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}

export const projectsService = new ProjectsService();
