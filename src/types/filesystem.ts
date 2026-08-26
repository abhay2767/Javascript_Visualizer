export interface FileNode {
  id: string;
  type: "file";
  name: string; // Must end with .js
  content: string;
  parentId: string | null;
  createdAt: number;
  updatedAt: number;
  isExample?: boolean;
}

export interface FolderNode {
  id: string;
  type: "folder";
  name: string;
  parentId: string | null;
  createdAt: number;
  updatedAt: number;
}

export type FSNode = FileNode | FolderNode;

export interface RecentFileRecord {
  fileId: string;
  openedAt: number;
}

export interface ContextMenuState {
  x: number;
  y: number;
  targetNodeId: string | null;
  targetType: "file" | "folder" | "root";
}
