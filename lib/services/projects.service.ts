import { supabase, isSupabaseConfigured } from '../supabase';
import { Project, Apartment } from '@/types';

// Mock apartments for projects
const mockApartmentsKvartal: Apartment[] = [
  {
    id: 'apt-kvartal-1',
    projectId: 'prj-kvartal-domashniy',
    lotNumber: '12-345',
    roomType: 'STUDIO',
    area: 28.5,
    floor: 5,
    section: 'А',
    price: 8500000,
    status: 'AVAILABLE',
    address: 'ЖК «Квартал Домашний», ул. Донецкая, корпус А, кв. 12-345',
  },
  {
    id: 'apt-kvartal-2',
    projectId: 'prj-kvartal-domashniy',
    lotNumber: '14-267',
    roomType: '1_ROOM',
    area: 42.3,
    floor: 8,
    section: 'Б',
    price: 12300000,
    status: 'AVAILABLE',
    address: 'ЖК «Квартал Домашний», ул. Донецкая, корпус Б, кв. 14-267',
  },
  {
    id: 'apt-kvartal-3',
    projectId: 'prj-kvartal-domashniy',
    lotNumber: '15-189',
    roomType: '2_ROOM',
    area: 65.7,
    floor: 12,
    section: 'А',
    price: 18900000,
    status: 'AVAILABLE',
    address: 'ЖК «Квартал Домашний», ул. Донецкая, корпус А, кв. 15-189',
  },
  {
    id: 'apt-kvartal-4',
    projectId: 'prj-kvartal-domashniy',
    lotNumber: '16-034',
    roomType: '3_ROOM',
    area: 89.2,
    floor: 7,
    section: 'Б',
    price: 25600000,
    status: 'AVAILABLE',
    address: 'ЖК «Квартал Домашний», ул. Донецкая, корпус Б, кв. 16-034',
  },
];

const mockApartmentsSoyuz: Apartment[] = [
  {
    id: 'apt-soyuz-1',
    projectId: 'prj-soyuz',
    lotNumber: '03-112',
    roomType: 'STUDIO',
    area: 30.1,
    floor: 3,
    section: '1',
    price: 7200000,
    status: 'AVAILABLE',
    address: 'ЖК «СОЮЗ», ул. Сельскохозяйственная, корпус 1, кв. 03-112',
  },
  {
    id: 'apt-soyuz-2',
    projectId: 'prj-soyuz',
    lotNumber: '05-278',
    roomType: '1_ROOM',
    area: 45.8,
    floor: 9,
    section: '2',
    price: 11500000,
    status: 'AVAILABLE',
    address: 'ЖК «СОЮЗ», ул. Сельскохозяйственная, корпус 2, кв. 05-278',
  },
  {
    id: 'apt-soyuz-3',
    projectId: 'prj-soyuz',
    lotNumber: '07-145',
    roomType: '2_ROOM',
    area: 68.4,
    floor: 15,
    section: '1',
    price: 17800000,
    status: 'AVAILABLE',
    address: 'ЖК «СОЮЗ», ул. Сельскохозяйственная, корпус 1, кв. 07-145',
  },
  {
    id: 'apt-soyuz-4',
    projectId: 'prj-soyuz',
    lotNumber: '08-056',
    roomType: '3_ROOM',
    area: 92.6,
    floor: 11,
    section: '2',
    price: 24200000,
    status: 'AVAILABLE',
    address: 'ЖК «СОЮЗ», ул. Сельскохозяйственная, корпус 2, кв. 08-056',
  },
  {
    id: 'apt-soyuz-5',
    projectId: 'prj-soyuz',
    lotNumber: '09-023',
    roomType: '4_ROOM',
    area: 115.3,
    floor: 18,
    section: '1',
    price: 32100000,
    status: 'AVAILABLE',
    address: 'ЖК «СОЮЗ», ул. Сельскохозяйственная, корпус 1, кв. 09-023',
  },
];

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
    apartments: mockApartmentsKvartal,
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
    apartments: mockApartmentsSoyuz,
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
