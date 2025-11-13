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
// Based on SQL import: scripts/import-developers-projects-fixed.sql
const mockProjects: Project[] = [
  // Группа «Самолет» projects
  { id: 'prj-kvartal-domashniy', developerId: 'dev-samolot', projectName: 'ЖК «Квартал Домашний»', region: 'Москва', city: 'Москва', address: 'ул. Донецкая', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },
  { id: 'prj-troparevo', developerId: 'dev-samolot', projectName: '«Тропарево Парк»', region: 'Москва', city: 'Москва', address: 'Новомосковский округ, Коммунарка', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },
  { id: 'prj-ostafevo', developerId: 'dev-samolot', projectName: 'ЖК «Остафьево»', region: 'Москва', city: 'Москва', address: 'пос. Рязановское, Остафьево', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },
  { id: 'prj-vnukovo', developerId: 'dev-samolot', projectName: 'ЖК «Новое Внуково»', region: 'Москва', city: 'Москва', address: 'Новомосковский округ, Внуково', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },
  { id: 'prj-alhimovo', developerId: 'dev-samolot', projectName: 'ЖК «Алхимово»', region: 'Москва', city: 'Москва', address: 'пос. Рязановское, Алхимово', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },
  { id: 'prj-kvartal-na-vode', developerId: 'dev-samolot', projectName: 'ЖК «Квартал на воде»', region: 'Москва', city: 'Москва', address: 'ул. Шоссейная', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },
  { id: 'prj-rumyantsevo', developerId: 'dev-samolot', projectName: 'ЖК «Квартал Румянцево»', region: 'Москва', city: 'Москва', address: 'Новомосковский округ, Коммунарка', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },
  { id: 'prj-olhovy', developerId: 'dev-samolot', projectName: 'ЖК «Ольховый Квартал»', region: 'Москва', city: 'Москва', address: 'Новомосковский округ, пос. Газопровод', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },

  // Группа «Родина» projects
  { id: 'prj-soyuz', developerId: 'dev-rodina', projectName: 'ЖК «СОЮЗ»', region: 'Москва', city: 'Москва', address: 'ул. Сельскохозяйственная', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },
  { id: 'prj-peredelkino', developerId: 'dev-rodina', projectName: 'ЖК «Родина Переделкино»', region: 'Москва', city: 'Москва', address: 'Боровское ш.', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },

  // Unikey projects
  { id: 'prj-novye-smysly', developerId: 'dev-unikey', projectName: 'ЖК «Новые Смыслы»', region: 'Москва', city: 'Москва', address: 'ул. Александры Монаховой', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },

  // Брусника projects
  { id: 'prj-metronom', developerId: 'dev-brusnika', projectName: 'Квартал «Метроном»', region: 'Москва', city: 'Москва', address: 'ул. Тагильская', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },
  { id: 'prj-mons', developerId: 'dev-brusnika', projectName: 'Квартал «МОНС»', region: 'Москва', city: 'Москва', address: 'Огородный проезд', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },
  { id: 'prj-dom-a', developerId: 'dev-brusnika', projectName: 'ЖК «Дом А»', region: 'Москва', city: 'Москва', address: 'ул. Дубининская', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },

  // MR Group projects
  { id: 'prj-set', developerId: 'dev-mr-group', projectName: 'ЖК «SET»', region: 'Москва', city: 'Москва', address: 'ул. Верейская', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },

  // Plus Development projects
  { id: 'prj-detali', developerId: 'dev-plus', projectName: 'ЖК «Детали»', region: 'Москва', city: 'Москва', address: 'пос. Филимонковское', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },

  // Галс-Девелопмент projects
  { id: 'prj-monblan', developerId: 'dev-gals', projectName: 'ЖК «Монблан»', region: 'Москва', city: 'Москва', address: 'Шлюзовая наб.', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },
  { id: 'prj-rozhdestvevka', developerId: 'dev-gals', projectName: 'ЖК «Рождественка 8»', region: 'Москва', city: 'Москва', address: 'ул. Кузнецкий Мост, 17', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },

  // ГК «ОСНОВА» projects
  { id: 'prj-mirapolis', developerId: 'dev-osnova', projectName: 'ЖК «МИРАПОЛИС»', region: 'Москва', city: 'Москва', address: 'пр. Мира, 222', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },
  { id: 'prj-evopark', developerId: 'dev-osnova', projectName: 'ЖК «EVOPARK Измайлово»', region: 'Москва', city: 'Москва', address: 'ул. Электродная, 2А', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },

  // Forma projects
  { id: 'prj-moments', developerId: 'dev-forma', projectName: 'ЖК «Moments»', region: 'Москва', city: 'Москва', address: 'Волоколамское ш.', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },
  { id: 'prj-soul', developerId: 'dev-forma', projectName: 'ЖК «SOUL»', region: 'Москва', city: 'Москва', address: 'ул. Часовая', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },

  // ГК ФСК projects
  { id: 'prj-amber', developerId: 'dev-fsk', projectName: 'ЖК «AMBER CITY»', region: 'Москва', city: 'Москва', address: 'ул. Розанова', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },
  { id: 'prj-sky', developerId: 'dev-fsk', projectName: 'ЖК «Sky Garden»', region: 'Москва', city: 'Москва', address: 'Строительный проезд', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },
  { id: 'prj-rotterdam', developerId: 'dev-fsk', projectName: 'ЖК «Rotterdam»', region: 'Москва', city: 'Москва', address: 'Варшавское ш.', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },

  // ДОНСТРОЙ projects
  { id: 'prj-sobytie', developerId: 'dev-donstroy', projectName: 'ЖК «Событие»', region: 'Москва', city: 'Москва', address: 'ул. Лобачевского', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },

  // ЛСР. Недвижимость-Москва projects
  { id: 'prj-luchi', developerId: 'dev-lsr', projectName: 'ЖК «ЛУЧИ»', region: 'Москва', city: 'Москва', address: 'ул. Производственная', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },
  { id: 'prj-dmitrovskoe', developerId: 'dev-lsr', projectName: 'ЖК «Дмитровское небо»', region: 'Москва', city: 'Москва', address: 'Ильменский проезд', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },

  // ДСК-1 projects
  { id: 'prj-salarevo', developerId: 'dev-dsk', projectName: '«1-й Саларьевский»', region: 'Москва', city: 'Москва', address: 'пос. Московский', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },

  // Level Group projects
  { id: 'prj-level-kavkaz', developerId: 'dev-level', projectName: 'ЖК «Level Кавказский бульвар»', region: 'Москва', city: 'Москва', address: 'Кавказский бульвар', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },
  { id: 'prj-level-amur', developerId: 'dev-level', projectName: 'ЖК «Level Амурская»', region: 'Москва', city: 'Москва', address: 'ул. Амурская', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },
  { id: 'prj-level-pavel', developerId: 'dev-level', projectName: 'ЖК «Level Павелецкая»', region: 'Москва', city: 'Москва', address: 'ул. Павелецкая', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },
  { id: 'prj-lefort', developerId: 'dev-level', projectName: 'ЖК «Лефорт»', region: 'Москва', city: 'Москва', address: 'ул. Лефортовская', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },
  { id: 'prj-level-presn', developerId: 'dev-level', projectName: 'ЖК «Level Пресненский»', region: 'Москва', city: 'Москва', address: 'Пресненская наб.', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },
  { id: 'prj-reka', developerId: 'dev-level', projectName: 'ЖК «Река»', region: 'Москва', city: 'Москва', address: 'наб. Тараса Шевченко', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },
  { id: 'prj-level-ambul', developerId: 'dev-level', projectName: 'ЖК «Level Амбулаторный»', region: 'Москва', city: 'Москва', address: 'Амбулаторный проезд', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },
  { id: 'prj-level-rimskaya', developerId: 'dev-level', projectName: 'Дом «Level Римская»', region: 'Москва', city: 'Москва', address: 'пл. Рогожская Застава', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },
  { id: 'prj-level-suharev', developerId: 'dev-level', projectName: 'ЖК «Level Сухаревская»', region: 'Москва', city: 'Москва', address: 'ул. Сретенка', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },
  { id: 'prj-level-donskoj', developerId: 'dev-level', projectName: 'ЖК «Level Донской»', region: 'Москва', city: 'Москва', address: 'ул. Донская', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },
  { id: 'prj-level-sher', developerId: 'dev-level', projectName: 'ЖК «Level Шереметьевская»', region: 'Москва', city: 'Москва', address: 'ул. Шереметьевская', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },
  { id: 'prj-level-lenin', developerId: 'dev-level', projectName: 'ЖК «Level Ленинградский»', region: 'Москва', city: 'Москва', address: 'Ленинградский проспект', isActive: true, apartments: [], createdAt: new Date(), updatedAt: new Date() },
];

// Generate apartments for all mock projects
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
