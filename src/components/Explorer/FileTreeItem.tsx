"use client";

import {
  ChevronDown,
  ChevronRight,
  FileCode,
  Folder,
  FolderOpen,
  MoreVertical,
} from "lucide-react";
import type { ContextMenuState, FileNode, FolderNode, FSNode } from "@/types/filesystem";

export function FileTreeItem({
  node,
  depth,
  activeFileId,
  isDirty,
  expandedFolders,
  matchingNodeIds,
  onToggleFolder,
  onOpenFile,
  onContextMenu,
}: {
  node: FSNode;
  depth: number;
  activeFileId: string | null;
  isDirty: boolean;
  expandedFolders: Record<string, boolean>;
  matchingNodeIds: Set<string> | null;
  onToggleFolder: (id: string) => void;
  onOpenFile: (file: FileNode) => void;
  onContextMenu: (e: React.MouseEvent, state: ContextMenuState) => void;
}) {
  if (matchingNodeIds && !matchingNodeIds.has(node.id)) {
    return null;
  }

  const isFolder = node.type === "folder";
  const isExpanded = expandedFolders[node.id] || false;
  const isActive = activeFileId === node.id;

  const handleRowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFolder) {
      onToggleFolder(node.id);
    } else {
      onOpenFile(node as FileNode);
    }
  };

  const handleContextMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(e, {
      x: e.clientX,
      y: e.clientY,
      targetNodeId: node.id,
      targetType: isFolder ? "folder" : "file",
    });
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    onContextMenu(e, {
      x: rect.left,
      y: rect.bottom + 4,
      targetNodeId: node.id,
      targetType: isFolder ? "folder" : "file",
    });
  };

  return (
    <div
      className={`tree-item ${isFolder ? "folder-item" : "file-item"} ${
        isActive ? "active" : ""
      }`}
      style={{ paddingLeft: `${depth * 14 + 10}px` }}
      onClick={handleRowClick}
      onContextMenu={handleContextMenuClick}
    >
      <span className="tree-arrow">
        {isFolder && (isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
      </span>

      <span className="tree-icon">
        {isFolder ? (
          isExpanded ? (
            <FolderOpen size={15} className="folder-icon open" />
          ) : (
            <Folder size={15} className="folder-icon" />
          )
        ) : (
          <FileCode size={15} className="file-icon" />
        )}
      </span>

      <span className="tree-label">
        {node.name}
        {!isFolder && isActive && isDirty && <span className="dirty-dot">•</span>}
      </span>

      <button className="more-btn" onClick={handleMoreClick} aria-label="Item actions">
        <MoreVertical size={13} />
      </button>
    </div>
  );
}
