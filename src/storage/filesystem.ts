import type { FileNode, FolderNode, FSNode } from "@/types/filesystem";
import {
  deleteNodeFromDB,
  getAllNodesFromDB,
  getRecentsFromDB,
  saveNodeToDB,
  saveRecentToDB,
} from "./indexedDb";

export function formatJsFileName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "untitled.js";
  if (trimmed.endsWith(".js")) return trimmed;
  // If user typed another extension like app.ts or app.py, replace extension or append .js
  if (trimmed.includes(".") && !trimmed.endsWith(".")) {
    const parts = trimmed.split(".");
    parts[parts.length - 1] = "js";
    return parts.join(".");
  }
  return `${trimmed}.js`;
}

export function generateId(): string {
  return `node_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export async function initializeFileSystem(): Promise<FSNode[]> {
  let nodes = await getAllNodesFromDB();

  if (nodes.length === 0) {
    const dsaFolder: FolderNode = {
      id: "folder_dsa",
      type: "folder",
      name: "DSA",
      parentId: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const bubbleSortFile: FileNode = {
      id: "file_bubble_sort",
      type: "file",
      name: "bubble-sort.js",
      content: `// Bubble Sort Example\nlet arr = [5, 3, 8, 1, 2];\n\nfor (let i = 0; i < arr.length; i++) {\n  for (let j = 0; j < arr.length - i - 1; j++) {\n    if (arr[j] > arr[j + 1]) {\n      let temp = arr[j];\n      arr[j] = arr[j + 1];\n      arr[j + 1] = temp;\n    }\n  }\n}\n\nconsole.log("Sorted:", arr);`,
      parentId: "folder_dsa",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const practiceFile: FileNode = {
      id: "file_practice",
      type: "file",
      name: "practice.js",
      content: `// My Practice Code\nlet sum = 0;\nfor (let i = 1; i <= 10; i++) {\n  sum += i;\n}\nconsole.log("Total sum:", sum);`,
      parentId: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await saveNodeToDB(dsaFolder);
    await saveNodeToDB(bubbleSortFile);
    await saveNodeToDB(practiceFile);

    await saveRecentToDB(bubbleSortFile.id);
    await saveRecentToDB(practiceFile.id);

    nodes = [dsaFolder, bubbleSortFile, practiceFile];
  }

  return nodes;
}

export function checkNameConflict(
  nodes: FSNode[],
  name: string,
  parentId: string | null,
  excludeId?: string
): boolean {
  return nodes.some(
    (node) =>
      node.parentId === parentId &&
      node.id !== excludeId &&
      node.name.toLowerCase() === name.toLowerCase()
  );
}

export function getChildNodeIds(nodes: FSNode[], folderId: string): string[] {
  const ids: string[] = [folderId];
  const directChildren = nodes.filter((n) => n.parentId === folderId);
  for (const child of directChildren) {
    if (child.type === "folder") {
      ids.push(...getChildNodeIds(nodes, child.id));
    } else {
      ids.push(child.id);
    }
  }
  return ids;
}

export async function deleteNodeRecursively(nodes: FSNode[], targetId: string): Promise<string[]> {
  const target = nodes.find((n) => n.id === targetId);
  if (!target) return [];

  let idsToDelete: string[] = [];
  if (target.type === "folder") {
    idsToDelete = getChildNodeIds(nodes, targetId);
  } else {
    idsToDelete = [targetId];
  }

  for (const id of idsToDelete) {
    await deleteNodeFromDB(id);
  }

  return idsToDelete;
}

export { getRecentsFromDB, saveNodeToDB, saveRecentToDB };
