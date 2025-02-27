import { supabase } from './supabase';

export interface EntryResult {
  success: boolean;
  message: string;
  entry_id?: string;
}

export interface EntryStats {
  total_entries: number;
  unique_domains: number;
  unique_users: number;
  entries_last_24h: number;
  latest_upload: string;
}

export class DatabaseService {
  private static instance: DatabaseService;
  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async processEntry(content: string): Promise<EntryResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');

      const { data, error } = await supabase
        .rpc('process_entry', {
          p_content: content,
          p_user_id: user.id
        });

      if (error) throw error;

      return {
        success: data[0].success,
        message: data[0].message,
        entry_id: data[0].entry_id
      };
    } catch (error) {
      console.error('Error processing entry:', error);
      return {
        success: false,
        message: error.message || 'Failed to process entry'
      };
    }
  }

  async getStats(): Promise<EntryStats | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');

      const { data, error } = await supabase
        .rpc('get_entry_stats', {
          p_user_id: user.id
        });

      if (error) throw error;
      return data[0] || null;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return null;
    }
  }

  async batchProcess(entries: string[]): Promise<{
    successful: number;
    failed: number;
    duplicates: number;
  }> {
    const results = {
      successful: 0,
      failed: 0,
      duplicates: 0
    };

    for (const entry of entries) {
      const result = await this.processEntry(entry);
      
      if (result.success) {
        results.successful++;
      } else if (result.message === 'Duplicate entry') {
        results.duplicates++;
      } else {
        results.failed++;
      }
    }

    return results;
  }
}

export const db = DatabaseService.getInstance();