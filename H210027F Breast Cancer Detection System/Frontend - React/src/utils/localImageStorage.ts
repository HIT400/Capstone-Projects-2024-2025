
/**
 * Utility for storing and retrieving images locally on the client side
 * using a combination of in-memory storage and IndexedDB for persistence.
 */

// In-memory image cache for quick access
const imageCache = new Map<string, string>();

// IndexedDB setup
const DB_NAME = 'breastCancerClassificationDB';
const STORE_NAME = 'scanImages';
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

// Initialize the database
export const initImageDB = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve();
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Error opening IndexedDB:', event);
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      console.log('IndexedDB opened successfully');
      resolve();
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        console.log('Object store created');
      }
    };
  });
};

// Store an image in both memory and IndexedDB
export const storeImage = async (id: string, imageDataUrl: string): Promise<void> => {
  // Store in memory cache
  imageCache.set(id, imageDataUrl);

  // Store in IndexedDB for persistence
  if (!db) await initImageDB();

  return new Promise((resolve, reject) => {
    try {
      const transaction = db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.put({ id, imageDataUrl });
      
      request.onsuccess = () => {
        console.log(`Image ${id} stored successfully`);
        resolve();
      };
      
      request.onerror = (event) => {
        console.error('Error storing image:', event);
        reject(new Error('Failed to store image in IndexedDB'));
      };
    } catch (error) {
      console.error('Error in storeImage transaction:', error);
      reject(error);
    }
  });
};

// Retrieve an image from cache or IndexedDB
export const getImage = async (id: string): Promise<string | null> => {
  // Check memory cache first
  if (imageCache.has(id)) {
    return imageCache.get(id)!;
  }
  
  // If not in memory, check IndexedDB
  if (!db) await initImageDB();
  
  return new Promise((resolve, reject) => {
    try {
      const transaction = db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);
      
      request.onsuccess = () => {
        if (request.result) {
          const imageDataUrl = request.result.imageDataUrl;
          // Add to memory cache for future quick access
          imageCache.set(id, imageDataUrl);
          resolve(imageDataUrl);
        } else {
          resolve(null);
        }
      };
      
      request.onerror = (event) => {
        console.error('Error retrieving image:', event);
        reject(new Error('Failed to retrieve image from IndexedDB'));
      };
    } catch (error) {
      console.error('Error in getImage transaction:', error);
      reject(error);
    }
  });
};

// Check if an image exists in storage
export const hasImage = async (id: string): Promise<boolean> => {
  if (imageCache.has(id)) return true;
  
  // If not in memory, check IndexedDB
  if (!db) await initImageDB();
  
  return new Promise((resolve, reject) => {
    try {
      const transaction = db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.count(id);
      
      request.onsuccess = () => {
        resolve(request.result > 0);
      };
      
      request.onerror = (event) => {
        console.error('Error checking image existence:', event);
        reject(new Error('Failed to check image existence in IndexedDB'));
      };
    } catch (error) {
      console.error('Error in hasImage transaction:', error);
      reject(error);
    }
  });
};

// Convert a File object to a base64 data URL
export const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      resolve(reader.result as string);
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsDataURL(file);
  });
};
