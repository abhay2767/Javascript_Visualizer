import { useCallback, useEffect, useMemo, useState } from "react";
import type { FileNode, FolderNode, FSNode, RecentFileRecord } from "@/types/filesystem";
import {
  checkNameConflict,
  deleteNodeRecursively,
  formatJsFileName,
  generateId,
  getRecentsFromDB,
  initializeFileSystem,
  saveNodeToDB,
  saveRecentToDB,
} from "@/storage/filesystem";

export function useFileSystem() {
  const [nodes, setNodes] = useState<FSNode[]>([]);
  const [recents, setRecents] = useState<RecentFileRecord[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    folder_dsa: true,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Initialize DB on mount
  useEffect(() => {
    let mounted = true;
    initializeFileSystem().then(async (initialNodes) => {
      if (!mounted) return;
      setNodes(initialNodes);
      const recentRecords = await getRecentsFromDB();
      setRecents(recentRecords);
      setIsLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const toggleFolder = useCallback((folderId: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
  }, []);

  const expandFolder = useCallback((folderId: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folderId]: true }));
  }, []);

  const recordRecent = useCallback(async (fileId: string) => {
    await saveRecentToDB(fileId);
    const updated = await getRecentsFromDB();
    setRecents(updated);
  }, []);

  const createFile = useCallback(
    async (
      rawName: string,
      parentId: string | null = null,
      initialContent = "// New File\n"
    ): Promise<{ file?: FileNode; error?: string }> => {
      const name = formatJsFileName(rawName);
      if (checkNameConflict(nodes, name, parentId)) {
        return { error: `A file named "${name}" already exists in this location.` };
      }

      const newFile: FileNode = {
        id: generateId(),
        type: "file",
        name,
        content: initialContent,
        parentId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await saveNodeToDB(newFile);
      setNodes((prev) => [...prev, newFile]);
      if (parentId) expandFolder(parentId);
      await recordRecent(newFile.id);

      return { file: newFile };
    },
    [nodes, expandFolder, recordRecent]
  );

  const createFolder = useCallback(
    async (
      rawName: string,
      parentId: string | null = null
    ): Promise<{ folder?: FolderNode; error?: string }> => {
      const name = rawName.trim();
      if (!name) return { error: "Folder name cannot be empty." };
      if (checkNameConflict(nodes, name, parentId)) {
        return { error: `A folder named "${name}" already exists in this location.` };
      }

      const newFolder: FolderNode = {
        id: generateId(),
        type: "folder",
        name,
        parentId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await saveNodeToDB(newFolder);
      setNodes((prev) => [...prev, newFolder]);
      setExpandedFolders((prev) => ({ ...prev, [newFolder.id]: true }));
      if (parentId) expandFolder(parentId);

      return { folder: newFolder };
    },
    [nodes, expandFolder]
  );

  const updateFileContent = useCallback(
    async (fileId: string, content: string): Promise<void> => {
      setNodes((prev) => {
        const target = prev.find((n) => n.id === fileId);
        if (!target || target.type !== "file") return prev;

        const updated: FileNode = {
          ...target,
          content,
          updatedAt: Date.now(),
        };

        saveNodeToDB(updated);
        return prev.map((n) => (n.id === fileId ? updated : n));
      });
      await recordRecent(fileId);
    },
    [recordRecent]
  );

  const renameNode = useCallback(
    async (id: string, rawNewName: string): Promise<{ error?: string }> => {
      const target = nodes.find((n) => n.id === id);
      if (!target) return { error: "Item not found." };

      const newName = target.type === "file" ? formatJsFileName(rawNewName) : rawNewName.trim();
      if (!newName) return { error: "Name cannot be empty." };

      if (checkNameConflict(nodes, newName, target.parentId, id)) {
        return { error: `An item named "${newName}" already exists in this folder.` };
      }

      const updated: FSNode = {
        ...target,
        name: newName,
        updatedAt: Date.now(),
      };

      await saveNodeToDB(updated);
      setNodes((prev) => prev.map((n) => (n.id === id ? updated : n)));
      return {};
    },
    [nodes]
  );

  const deleteNode = useCallback(
    async (id: string): Promise<void> => {
      const deletedIds = await deleteNodeRecursively(nodes, id);
      setNodes((prev) => prev.filter((n) => !deletedIds.includes(n.id)));
      setRecents((prev) => prev.filter((r) => !deletedIds.includes(r.fileId)));
    },
    [nodes]
  );

  // Search filtering
  const matchingNodeIds = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase().trim();
    const matchingFiles = nodes.filter((n) => n.name.toLowerCase().includes(q));
    const matchingIds = new Set<string>();

    for (const file of matchingFiles) {
      matchingIds.add(file.id);
      let curr = file.parentId;
      while (curr) {
        matchingIds.add(curr);
        const parent = nodes.find((n) => n.id === curr);
        curr = parent ? parent.parentId : null;
      }
    }
    return matchingIds;
  }, [nodes, searchQuery]);

  return {
    nodes,
    recents,
    expandedFolders,
    searchQuery,
    setSearchQuery,
    isLoading,
    toggleFolder,
    expandFolder,
    createFile,
    createFolder,
    updateFileContent,
    renameNode,
    deleteNode,
    recordRecent,
    matchingNodeIds,
  };
}
