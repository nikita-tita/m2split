import { Event, EventType, UserRole } from '@/types';
import { supabase, isSupabaseConfigured } from '../supabase';

// In-memory event log for client-side (fallback when Supabase not configured)
let eventLog: Event[] = [];

interface CreateEventInput {
  type: EventType;
  entityType: 'DEAL' | 'REGISTRY' | 'PAYMENT' | 'CONTRACTOR' | 'DOCUMENT';
  entityId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  description: string;
  metadata?: Record<string, any>;
}

class EventsService {
  /**
   * Log an event
   */
  async logEvent(input: CreateEventInput): Promise<Event> {
    const event: Event = {
      id: `evt${Date.now()}`,
      type: input.type,
      entityType: input.entityType,
      entityId: input.entityId,
      userId: input.userId,
      userName: input.userName,
      userRole: input.userRole,
      description: input.description,
      metadata: input.metadata,
      timestamp: new Date(),
    };

    if (!isSupabaseConfigured()) {
      // Store in memory
      eventLog.push(event);
      console.log('📝 Event logged:', event);
      return event;
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .insert([{
          type: event.type,
          entity_type: event.entityType,
          entity_id: event.entityId,
          user_id: event.userId,
          user_name: event.userName,
          user_role: event.userRole,
          description: event.description,
          metadata: event.metadata,
          timestamp: event.timestamp,
        }])
        .select()
        .single();

      if (error) throw error;

      return {
        ...event,
        id: data.id,
      };
    } catch (error) {
      console.error('Failed to log event:', error);
      // Fallback to in-memory
      eventLog.push(event);
      return event;
    }
  }

  /**
   * Get events for an entity
   */
  async getEventsForEntity(entityType: string, entityId: string): Promise<Event[]> {
    if (!isSupabaseConfigured()) {
      return eventLog.filter(
        e => e.entityType === entityType && e.entityId === entityId
      ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      return (data || []).map(this.mapEvent);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      return [];
    }
  }

  /**
   * Get all events (for admin/audit purposes)
   */
  async getAllEvents(filters?: {
    entityType?: string;
    userId?: string;
    type?: EventType;
    limit?: number;
  }): Promise<Event[]> {
    if (!isSupabaseConfigured()) {
      let filtered = [...eventLog];

      if (filters?.entityType) {
        filtered = filtered.filter(e => e.entityType === filters.entityType);
      }
      if (filters?.userId) {
        filtered = filtered.filter(e => e.userId === filters.userId);
      }
      if (filters?.type) {
        filtered = filtered.filter(e => e.type === filters.type);
      }

      filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      if (filters?.limit) {
        filtered = filtered.slice(0, filters.limit);
      }

      return filtered;
    }

    try {
      let query = supabase
        .from('events')
        .select('*')
        .order('timestamp', { ascending: false });

      if (filters?.entityType) {
        query = query.eq('entity_type', filters.entityType);
      }
      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(this.mapEvent);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      return [];
    }
  }

  /**
   * Clear in-memory event log (for testing)
   */
  clearEventLog(): void {
    eventLog = [];
  }

  // Helper to map database record to Event
  private mapEvent(data: any): Event {
    return {
      id: data.id,
      type: data.type,
      entityType: data.entity_type,
      entityId: data.entity_id,
      userId: data.user_id,
      userName: data.user_name,
      userRole: data.user_role,
      description: data.description,
      metadata: data.metadata,
      timestamp: new Date(data.timestamp),
    };
  }
}

export const eventsService = new EventsService();
