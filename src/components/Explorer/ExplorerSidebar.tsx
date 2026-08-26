"use client";

import { useState } from "react";
import {
  FilePlus,
  FolderPlus,
  FolderTree,
  HardDrive,
  MoreHorizontal,
  RotateCcw,
  X,
} from "lucide-react";
import type { ContextMenuState, FileNode, FSNode, RecentFileRecord } from "@/types/filesystem";
import { ContextMenu } from "./ContextMenu";
import { ExamplesSection } from "./ExamplesSection";
import { ExplorerSearch } from "./ExplorerSearch";
import { FileTree } from "./FileTree";
import { RecentFiles } from "./RecentFiles";

export function ExplorerSidebar({
  isOpen,
  isMobileDrawer,
  nodes,
  recents,
  expandedFolders,
  searchQuery,
  activeFileId,
  activeExampleIndex,
  isDirty,
  onSearchChange,
  onToggleFolder,
  onOpenFile,
  onSelectExample,
  onCloseMobileDrawer,
  onCreateFile,
  onCreateFolder,
  onRenameNode,
  onDeleteNode,
  onOpenCreateFileModal,
  onOpenCreateFolderModal,
  onOpenRenameModal,
  onOpenDeleteModal,
}: {
  isOpen: boolean;
  isMobileDrawer?: boolean;
  nodes: FSNode[];
  recents: RecentFileRecord[];
  expandedFolders: Record<string, boolean>;
  searchQuery: string;
  activeFileId: string | null;
  activeExampleIndex: number | null;
  isDirty: boolean;
  onSearchChange: (query: string) => void;
  onToggleFolder: (id: string) => void;
  onOpenFile: (file: FileNode) => void;
  onSelectExample: (index: number) => void;
  onCloseMobileDrawer?: () => void;
  onCreateFile: (name: string, parentId: string | null) => Promise<void>;
  onCreateFolder: (name: string, parentId: string | null) => Promise<void>;
  onRenameNode: (id: string, name: string) => Promise<void>;
  onDeleteNode: (id: string) => Promise<void>;
  onOpenCreateFileModal: (parentId: string | null) => void;
  onOpenCreateFolderModal: (parentId: string | null) => void;
  onOpenRenameModal: (nodeId: string) => void;
  onOpenDeleteModal: (nodeId: string) => void;
}) {
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  if (!isOpen) return null;

  const handleRootContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      targetNodeId: null,
      targetType: "root",
    });
  };

  const handleOpenFileItem = (file: FileNode) => {
    onOpenFile(file);
    if (isMobileDrawer && onCloseMobileDrawer) {
      onCloseMobileDrawer();
    }
  };

  const handleSelectExampleItem = (index: number) => {
    onSelectExample(index);
    if (isMobileDrawer && onCloseMobileDrawer) {
      onCloseMobileDrawer();
    }
  };

  return (
    <>
      {isMobileDrawer && (
        <div className="drawer-backdrop" onClick={onCloseMobileDrawer} aria-label="Close sidebar" />
      )}

      <aside className={`explorer-sidebar ${isMobileDrawer ? "mobile-drawer" : ""}`}>
        <div className="explorer-header">
          <div className="title">
            <FolderTree size={16} /> EXPLORER
          </div>
          <div className="header-actions">
            <button
              onClick={() => onOpenCreateFileModal(null)}
              title="New File"
              aria-label="New File"
            >
              <FilePlus size={15} />
            </button>
            <button
              onClick={() => onOpenCreateFolderModal(null)}
              title="New Folder"
              aria-label="New Folder"
            >
              <FolderPlus size={15} />
            </button>
            {isMobileDrawer && onCloseMobileDrawer && (
              <button
                onClick={onCloseMobileDrawer}
                title="Close Explorer"
                aria-label="Close Explorer"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <ExplorerSearch value={searchQuery} onChange={onSearchChange} />

        <div className="explorer-content" onContextMenu={handleRootContextMenu}>
          <RecentFiles
            recents={recents}
            nodes={nodes}
            activeFileId={activeFileId}
            onOpenFile={handleOpenFileItem}
          />

          <ExamplesSection
            activeExampleIndex={activeExampleIndex}
            onSelectExample={handleSelectExampleItem}
          />

          <div className="explorer-section">
            <div className="section-title">
              <HardDrive size={13} /> MY FILES
              <div className="section-actions">
                <button
                  onClick={() => onOpenCreateFileModal(null)}
                  title="New File in Root"
                  aria-label="New File in Root"
                >
                  <FilePlus size={13} />
                </button>
                <button
                  onClick={() => onOpenCreateFolderModal(null)}
                  title="New Folder in Root"
                  aria-label="New Folder in Root"
                >
                  <FolderPlus size={13} />
                </button>
              </div>
            </div>

            <FileTree
              nodes={nodes}
              activeFileId={activeFileId}
              isDirty={isDirty}
              expandedFolders={expandedFolders}
              matchingNodeIds={null}
              onToggleFolder={onToggleFolder}
              onOpenFile={handleOpenFileItem}
              onContextMenu={(_, state) => setContextMenu(state)}
              onNewFile={onOpenCreateFileModal}
              onNewFolder={onOpenCreateFolderModal}
            />
          </div>

          <div className="storage-hint">
            <small>💾 Files are stored locally in your browser storage.</small>
          </div>
        </div>
      </aside>

      <ContextMenu
        state={contextMenu}
        onClose={() => setContextMenu(null)}
        onNewFile={onOpenCreateFileModal}
        onNewFolder={onOpenCreateFolderModal}
        onRename={onOpenRenameModal}
        onDelete={onOpenDeleteModal}
      />
    </>
  );
}
