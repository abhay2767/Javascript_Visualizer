import type { FSNode, RecentFileRecord } from "@/types/filesystem";

const DB_NAME = "js_visualizer_fs_v1";
const DB_VERSION = 1;

const STORES = {
  NODES: "nodes",
  RECENTS: "recents",
} as const;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this environment"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORES.NODES)) {
        const nodeStore = db.createObjectStore(STORES.NODES, { keyPath: "id" });
        nodeStore.createIndex("parentId", "parentId", { unique: false });
        nodeStore.createIndex("name", "name", { unique: false });
        nodeStore.createIndex("type", "type", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.RECENTS)) {
        const recentStore = db.createObjectStore(STORES.RECENTS, { keyPath: "fileId" });
        recentStore.createIndex("openedAt", "openedAt", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllNodesFromDB(): Promise<FSNode[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.NODES, "readonly");
      const store = transaction.objectStore(STORES.NODES);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("IndexedDB getAllNodes error:", error);
    return [];
  }
}

export async function saveNodeToDB(node: FSNode): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.NODES, "readwrite");
      const store = transaction.objectStore(STORES.NODES);
      const request = store.put(node);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("IndexedDB saveNode error:", error);
  }
}

export async function deleteNodeFromDB(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.NODES, STORES.RECENTS], "readwrite");
      const nodeStore = transaction.objectStore(STORES.NODES);
      const recentStore = transaction.objectStore(STORES.RECENTS);
      nodeStore.delete(id);
      recentStore.delete(id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error("IndexedDB deleteNode error:", error);
  }
}

export async function getRecentsFromDB(): Promise<RecentFileRecord[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.RECENTS, "readonly");
      const store = transaction.objectStore(STORES.RECENTS);
      const request = store.getAll();
      request.onsuccess = () => {
        const records = (request.result || []) as RecentFileRecord[];
        records.sort((a, b) => b.openedAt - a.openedAt);
        resolve(records);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("IndexedDB getRecents error:", error);
    return [];
  }
}

export async function saveRecentToDB(fileId: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.RECENTS, "readwrite");
      const store = transaction.objectStore(STORES.RECENTS);
      const record: RecentFileRecord = { fileId, openedAt: Date.now() };
      const request = store.put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("IndexedDB saveRecent error:", error);
  }
}
