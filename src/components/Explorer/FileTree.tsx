"use client";

import { FilePlus, FolderPlus, HardDrive } from "lucide-react";
import type { ContextMenuState, FileNode, FSNode } from "@/types/filesystem";
import { FileTreeItem } from "./FileTreeItem";

export function FileTree({
  nodes,
  parentId = null,
  depth = 0,
  activeFileId,
  isDirty,
  expandedFolders,
  matchingNodeIds,
  onToggleFolder,
  onOpenFile,
  onContextMenu,
  onNewFile,
  onNewFolder,
}: {
  nodes: FSNode[];
  parentId?: string | null;
  depth?: number;
  activeFileId: string | null;
  isDirty: boolean;
  expandedFolders: Record<string, boolean>;
  matchingNodeIds: Set<string> | null;
  onToggleFolder: (id: string) => void;
  onOpenFile: (file: FileNode) => void;
  onContextMenu: (e: React.MouseEvent, state: ContextMenuState) => void;
  onNewFile: (targetFolderId: string | null) => void;
  onNewFolder: (targetFolderId: string | null) => void;
}) {
  const currentLevelNodes = nodes.filter((n) => n.parentId === parentId);

  // Sort folders first, then files alphabetically
  currentLevelNodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  if (parentId === null && currentLevelNodes.length === 0) {
    return (
      <div className="empty-tree">
        <p>No user files created yet.</p>
        <div className="empty-tree-actions">
          <button className="btn-sm" onClick={() => onNewFile(null)}>
            <FilePlus size={13} /> New File
          </button>
          <button className="btn-sm" onClick={() => onNewFolder(null)}>
            <FolderPlus size={13} /> New Folder
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tree-level">
      {currentLevelNodes.map((node) => {
        const isFolder = node.type === "folder";
        const isExpanded = expandedFolders[node.id] || false;
        const children = nodes.filter((n) => n.parentId === node.id);

        return (
          <div key={node.id} className="tree-node-wrapper">
            <FileTreeItem
              node={node}
              depth={depth}
              activeFileId={activeFileId}
              isDirty={isDirty}
              expandedFolders={expandedFolders}
              matchingNodeIds={matchingNodeIds}
              onToggleFolder={onToggleFolder}
              onOpenFile={onOpenFile}
              onContextMenu={onContextMenu}
            />

            {isFolder && isExpanded && children.length > 0 && (
              <FileTree
                nodes={nodes}
                parentId={node.id}
                depth={depth + 1}
                activeFileId={activeFileId}
                isDirty={isDirty}
                expandedFolders={expandedFolders}
                matchingNodeIds={matchingNodeIds}
                onToggleFolder={onToggleFolder}
                onOpenFile={onOpenFile}
                onContextMenu={onContextMenu}
                onNewFile={onNewFile}
                onNewFolder={onNewFolder}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
