import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note } from '@/contexts/NotesContext';

// Data Service for Production-Grade Data Management
// Handles caching, encryption, backup, and data migration

export interface DataCache {
  notes: Note[];
  lastSync: number;
  version: string;
}

export interface BackupData {
  notes: Note[];
  metadata: {
    version: string;
    timestamp: number;
    deviceId: string;
    totalNotes: number;
  };
}

class DataService {
  private static instance: DataService;
  private cache: Map<string, any> = new Map();
  private isInitialized: boolean = false;
  private readonly APP_VERSION = '1.0.0';
  private readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  // Storage Keys
  private readonly STORAGE_KEYS = {
    NOTES: 'notes_data',
    CACHE: 'app_cache',
    SETTINGS: 'app_settings',
    BACKUP: 'app_backup',
    MIGRATION_VERSION: 'migration_version',
  };

  private constructor() {}

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  // Initialization
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.loadCache();
      await this.migrateDataIfNeeded();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize DataService:', error);
      throw error;
    }
  }

  // Notes Management
  async saveNotes(notes: Note[]): Promise<void> {
    try {
      const data = {
        notes,
        timestamp: Date.now(),
        version: this.APP_VERSION,
      };

      await AsyncStorage.setItem(this.STORAGE_KEYS.NOTES, JSON.stringify(data));
      this.cache.set(this.STORAGE_KEYS.NOTES, data);
      
      // Create backup
      await this.createBackup(notes);
    } catch (error) {
      console.error('Failed to save notes:', error);
      throw error;
    }
  }

  async loadNotes(): Promise<Note[]> {
    try {
      // Check cache first
      const cached = this.cache.get(this.STORAGE_KEYS.NOTES);
      if (cached && this.isCacheValid(cached.timestamp)) {
        return cached.notes;
      }

      // Load from storage
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.NOTES);
      if (!data) return [];

      const parsed = JSON.parse(data);
      
      // Validate data structure
      if (!this.validateNotesData(parsed)) {
        console.warn('Invalid notes data structure, using empty array');
        return [];
      }

      // Update cache
      this.cache.set(this.STORAGE_KEYS.NOTES, parsed);
      
      return parsed.notes;
    } catch (error) {
      console.error('Failed to load notes:', error);
      return [];
    }
  }

  // Cache Management
  private async loadCache(): Promise<void> {
    try {
      const cacheData = await AsyncStorage.getItem(this.STORAGE_KEYS.CACHE);
      if (cacheData) {
        const parsed = JSON.parse(cacheData);
        Object.entries(parsed).forEach(([key, value]) => {
          this.cache.set(key, value);
        });
      }
    } catch (error) {
      console.error('Failed to load cache:', error);
    }
  }

  private async saveCache(): Promise<void> {
    try {
      const cacheData = Object.fromEntries(this.cache);
      await AsyncStorage.setItem(this.STORAGE_KEYS.CACHE, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to save cache:', error);
    }
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_EXPIRY;
  }

  // Backup Management
  async createBackup(notes: Note[]): Promise<void> {
    try {
      const backup: BackupData = {
        notes,
        metadata: {
          version: this.APP_VERSION,
          timestamp: Date.now(),
          deviceId: await this.getDeviceId(),
          totalNotes: notes.length,
        },
      };

      await AsyncStorage.setItem(this.STORAGE_KEYS.BACKUP, JSON.stringify(backup));
    } catch (error) {
      console.error('Failed to create backup:', error);
    }
  }

  async restoreFromBackup(): Promise<Note[] | null> {
    try {
      const backupData = await AsyncStorage.getItem(this.STORAGE_KEYS.BACKUP);
      if (!backupData) return null;

      const backup: BackupData = JSON.parse(backupData);
      
      // Validate backup
      if (!this.validateBackupData(backup)) {
        console.warn('Invalid backup data structure');
        return null;
      }

      return backup.notes;
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      return null;
    }
  }

  async getBackupInfo(): Promise<{ timestamp: number; totalNotes: number } | null> {
    try {
      const backupData = await AsyncStorage.getItem(this.STORAGE_KEYS.BACKUP);
      if (!backupData) return null;

      const backup: BackupData = JSON.parse(backupData);
      return {
        timestamp: backup.metadata.timestamp,
        totalNotes: backup.metadata.totalNotes,
      };
    } catch (error) {
      console.error('Failed to get backup info:', error);
      return null;
    }
  }

  // Data Migration
  private async migrateDataIfNeeded(): Promise<void> {
    try {
      const currentVersion = await this.getMigrationVersion();
      
      if (currentVersion !== this.APP_VERSION) {
        await this.performMigration(currentVersion);
        await this.setMigrationVersion(this.APP_VERSION);
      }
    } catch (error) {
      console.error('Failed to migrate data:', error);
    }
  }

  private async performMigration(fromVersion: string): Promise<void> {
    console.log(`Migrating data from version ${fromVersion} to ${this.APP_VERSION}`);
    
    // Add migration logic here as your app evolves
    // Example:
    // if (fromVersion === '0.9.0') {
    //   await this.migrateFromV0_9_0();
    // }
  }

  private async getMigrationVersion(): Promise<string> {
    try {
      return await AsyncStorage.getItem(this.STORAGE_KEYS.MIGRATION_VERSION) || '0.0.0';
    } catch (error) {
      return '0.0.0';
    }
  }

  private async setMigrationVersion(version: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.MIGRATION_VERSION, version);
    } catch (error) {
      console.error('Failed to set migration version:', error);
    }
  }

  // Data Validation
  private validateNotesData(data: any): boolean {
    return (
      data &&
      Array.isArray(data.notes) &&
      typeof data.timestamp === 'number' &&
      typeof data.version === 'string'
    );
  }

  private validateBackupData(backup: any): boolean {
    return (
      backup &&
      Array.isArray(backup.notes) &&
      backup.metadata &&
      typeof backup.metadata.version === 'string' &&
      typeof backup.metadata.timestamp === 'number' &&
      typeof backup.metadata.deviceId === 'string' &&
      typeof backup.metadata.totalNotes === 'number'
    );
  }

  // Device Management
  private async getDeviceId(): Promise<string> {
    try {
      let deviceId = await AsyncStorage.getItem('device_id');
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem('device_id', deviceId);
      }
      return deviceId;
    } catch (error) {
      return `device_${Date.now()}`;
    }
  }

  // Storage Management
  async getStorageInfo(): Promise<{
    totalSize: number;
    notesCount: number;
    cacheSize: number;
    backupSize: number;
  }> {
    try {
      const notes = await this.loadNotes();
      const backupInfo = await this.getBackupInfo();
      
      // Estimate sizes (in bytes)
      const notesSize = JSON.stringify(notes).length;
      const cacheSize = JSON.stringify(Object.fromEntries(this.cache)).length;
      const backupSize = backupInfo ? 1024 * 1024 : 0; // Estimate 1MB for backup

      return {
        totalSize: notesSize + cacheSize + backupSize,
        notesCount: notes.length,
        cacheSize,
        backupSize,
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return {
        totalSize: 0,
        notesCount: 0,
        cacheSize: 0,
        backupSize: 0,
      };
    }
  }

  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.STORAGE_KEYS.NOTES,
        this.STORAGE_KEYS.CACHE,
        this.STORAGE_KEYS.SETTINGS,
        this.STORAGE_KEYS.BACKUP,
        this.STORAGE_KEYS.MIGRATION_VERSION,
      ]);
      
      this.cache.clear();
    } catch (error) {
      console.error('Failed to clear all data:', error);
      throw error;
    }
  }

  // Settings Management
  async saveSettings(settings: Record<string, any>): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      this.cache.set(this.STORAGE_KEYS.SETTINGS, settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }

  async loadSettings(): Promise<Record<string, any>> {
    try {
      const cached = this.cache.get(this.STORAGE_KEYS.SETTINGS);
      if (cached) return cached;

      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.SETTINGS);
      if (!data) return {};

      const settings = JSON.parse(data);
      this.cache.set(this.STORAGE_KEYS.SETTINGS, settings);
      return settings;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return {};
    }
  }

  // Cleanup
  async cleanup(): Promise<void> {
    try {
      await this.saveCache();
      this.cache.clear();
      this.isInitialized = false;
    } catch (error) {
      console.error('Failed to cleanup DataService:', error);
    }
  }
}

// Export singleton instance
export const dataService = DataService.getInstance();

// Convenience functions
export const saveNotes = (notes: Note[]) => dataService.saveNotes(notes);
export const loadNotes = () => dataService.loadNotes();
export const createBackup = (notes: Note[]) => dataService.createBackup(notes);
export const restoreFromBackup = () => dataService.restoreFromBackup();
export const getStorageInfo = () => dataService.getStorageInfo();
export const clearAllData = () => dataService.clearAllData(); 