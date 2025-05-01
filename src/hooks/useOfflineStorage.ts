import { useState, useEffect } from 'react';
import { SessionTemplate } from '@/types';
import { useToast } from '@/hooks/use-toast';

const DB_NAME = 'fever_offline_db';
const DB_VERSION = 1;

interface NetworkStatus {
  isOnline: boolean;
  lastChecked: Date;
}

export const useOfflineStorage = () => {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    lastChecked: new Date()
  });

  const { toast } = useToast();

  useEffect(() => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event);
      toast({
        variant: 'destructive',
        title: 'Storage Error',
        description: 'Unable to access offline storage. Some features may not work properly.'
      });
    };

    request.onsuccess = (event) => {
      setDb((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      if (!database.objectStoreNames.contains('sessions')) {
        database.createObjectStore('sessions', { keyPath: 'id' });
      }

      if (!database.objectStoreNames.contains('audio_files')) {
        database.createObjectStore('audio_files', { keyPath: 'id' });
      }
    };

    const handleOnline = () => {
      setNetworkStatus({ isOnline: true, lastChecked: new Date() });
      toast({
        title: 'Connection Restored',
        description: 'You are back online. Changes will be synchronized.'
      });
    };

    const handleOffline = () => {
      setNetworkStatus({ isOnline: false, lastChecked: new Date() });
      toast({
        variant: 'destructive',
        title: 'Connection Lost',
        description: 'You are working offline. Changes will be saved locally.'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const intervalId = setInterval(() => {
      const isOnline = navigator.onLine;
      if (isOnline !== networkStatus.isOnline) {
        setNetworkStatus({ isOnline, lastChecked: new Date() });
      }
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
      db?.close();
    };
  }, []);

  const saveSessionOffline = async (session: SessionTemplate) => {
    if (!db) return false;

    try {
      return new Promise<boolean>((resolve) => {
        const transaction = db.transaction('sessions', 'readwrite');
        const store = transaction.objectStore('sessions');

        const request = store.put({
          ...session,
          last_modified_locally: new Date().toISOString()
        });

        request.onsuccess = () => resolve(true);
        request.onerror = () => resolve(false);
      });
    } catch (error) {
      console.error('Error saving session offline:', error);
      return false;
    }
  };

  const saveAudioOffline = async (trackId: string, audioBlob: Blob, audioUrl: string) => {
    if (!db) return false;

    try {
      return new Promise<boolean>((resolve) => {
        const transaction = db.transaction('audio_files', 'readwrite');
        const store = transaction.objectStore('audio_files');

        const request = store.put({
          id: trackId,
          blob: audioBlob,
          url: audioUrl,
          timestamp: new Date().toISOString()
        });

        request.onsuccess = () => resolve(true);
        request.onerror = () => resolve(false);
      });
    } catch (error) {
      console.error('Error saving audio offline:', error);
      return false;
    }
  };

  const getOfflineSession = async (sessionId: string) => {
    if (!db) return null;

    try {
      return new Promise<SessionTemplate | null>((resolve) => {
        const transaction = db.transaction('sessions', 'readonly');
        const store = transaction.objectStore('sessions');

        const request = store.get(sessionId);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => resolve(null);
      });
    } catch (error) {
      console.error('Error getting offline session:', error);
      return null;
    }
  };

  const getOfflineAudio = async (trackId: string) => {
    if (!db) return null;

    try {
      return new Promise<{ blob: Blob; url: string } | null>((resolve) => {
        const transaction = db.transaction('audio_files', 'readonly');
        const store = transaction.objectStore('audio_files');

        const request = store.get(trackId);

        request.onsuccess = () => {
          const result = request.result;
          if (result) {
            resolve({
              blob: result.blob,
              url: URL.createObjectURL(result.blob)
            });
          } else {
            resolve(null);
          }
        };
        request.onerror = () => resolve(null);
      });
    } catch (error) {
      console.error('Error getting offline audio:', error);
      return null;
    }
  };

  const getAllOfflineSessions = async () => {
    if (!db) return [];

    try {
      return new Promise<SessionTemplate[]>((resolve) => {
        const transaction = db.transaction('sessions', 'readonly');
        const store = transaction.objectStore('sessions');

        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
      });
    } catch (error) {
      console.error('Error getting all offline sessions:', error);
      return [];
    }
  };

  return {
    networkStatus,
    saveSessionOffline,
    saveAudioOffline,
    getOfflineSession,
    getOfflineAudio,
    getAllOfflineSessions
  };
};
