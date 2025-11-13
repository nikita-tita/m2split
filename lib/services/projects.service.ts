import { supabase, isSupabaseConfigured } from '../supabase';
import { Project, Apartment } from '@/types';

/**
 * Generate mock apartments for any project
 * Creates realistic apartments: studio, 1-room, 2-room, 3-room
 */
function generateMockApartments(project: Project): Apartment[] {
  const apartments: Apartment[] = [];
  const sections = ['А', 'Б', 'В', '1', '2', '3'];

  // Simple hash function to get consistent random values for each project
  const hash = (str: string) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h) + str.charCodeAt(i);
      h = h & h;
    }
    return Math.abs(h);
  };

  const projectHash = hash(project.id + project.projectName);
  const basePrice = 250000 + (projectHash % 100000); // 250k-350k per sqm

  // Helper to generate random value in range
  const randRange = (min: number, max: number, seed: number) => {
    return min + ((seed % 1000) / 1000) * (max - min);
  };

  const types = [
    { type: 'STUDIO' as const, count: 1, areaMin: 28, areaMax: 35, label: 'Студия' },
    { type: '1_ROOM' as const, count: 2, areaMin: 38, areaMax: 52, label: '1-комнатная' },
    { type: '2_ROOM' as const, count: 2, areaMin: 55, areaMax: 75, label: '2-комнатная' },
    { type: '3_ROOM' as const, count: 2, areaMin: 80, areaMax: 100, label: '3-комнатная' },
  ];

  let aptIndex = 0;

  types.forEach(({ type, count, areaMin, areaMax, label }) => {
    for (let i = 0; i < count; i++) {
      const seed = projectHash + aptIndex * 137;
      const area = Math.round(randRange(areaMin, areaMax, seed) * 10) / 10;
      const price = Math.round(area * basePrice / 100000) * 100000; // Round to 100k
      const floor = Math.floor(randRange(3, 18, seed + 1));
      const section = sections[seed % sections.length];
      const lotNum = `${String(floor).padStart(2, '0')}-${String(100 + aptIndex).slice(-3)}`;

      apartments.push({
        id: `apt-${project.id}-${aptIndex}`,
        projectId: project.id,
        lotNumber: lotNum,
        roomType: type,
        area,
        floor,
        section,
        price,
        status: 'AVAILABLE',
        address: `${project.projectName}, ${project.address}, корп. ${section}, кв. ${lotNum}`,
      });

      aptIndex++;
    }
  });

  return apartments;
}

// Mock projects for fallback (when Supabase is not configured)
const mockProjects: Project[] = [
  {
    id: 'prj-kvartal-domashniy',
    developerId: 'dev-samolot',
    projectName: 'ЖК «Квартал Домашний»',
    region: 'Москва',
    city: 'Москва',
    address: 'ул. Донецкая',
    isActive: true,
    apartments: [],
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
    apartments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Generate apartments for mock projects
mockProjects.forEach(project => {
  project.apartments = generateMockApartments(project);
});

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

      // Transform projects and add mock apartments to each
      const projects = (data || []).map(this.transformFromDB);
      projects.forEach(project => {
        project.apartments = generateMockApartments(project);
      });

      return projects;
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

      const project = this.transformFromDB(data);
      project.apartments = generateMockApartments(project);

      return project;
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
