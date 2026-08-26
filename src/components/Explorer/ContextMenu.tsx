"use client";

import { useEffect, useRef } from "react";
import { Edit2, FilePlus, FolderPlus, Trash2 } from "lucide-react";
import type { ContextMenuState } from "@/types/filesystem";

export function ContextMenu({
  state,
  onClose,
  onNewFile,
  onNewFolder,
  onRename,
  onDelete,
}: {
  state: ContextMenuState | null;
  onClose: () => void;
  onNewFile: (targetFolderId: string | null) => void;
  onNewFolder: (targetFolderId: string | null) => void;
  onRename: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!state) return null;

  const style = {
    top: `${Math.min(state.y, window.innerHeight - 160)}px`,
    left: `${Math.min(state.x, window.innerWidth - 180)}px`,
  };

  return (
    <div className="context-menu" ref={menuRef} style={style}>
      {(state.targetType === "folder" || state.targetType === "root") && (
        <>
          <button
            onClick={() => {
              onNewFile(state.targetNodeId);
              onClose();
            }}
          >
            <FilePlus size={14} /> New File
          </button>
          <button
            onClick={() => {
              onNewFolder(state.targetNodeId);
              onClose();
            }}
          >
            <FolderPlus size={14} /> New Folder
          </button>
          {state.targetType !== "root" && <div className="menu-divider" />}
        </>
      )}

      {state.targetType !== "root" && state.targetNodeId && (
        <>
          <button
            onClick={() => {
              onRename(state.targetNodeId!);
              onClose();
            }}
          >
            <Edit2 size={14} /> Rename
          </button>
          <button
            className="danger"
            onClick={() => {
              onDelete(state.targetNodeId!);
              onClose();
            }}
          >
            <Trash2 size={14} /> Delete
          </button>
        </>
      )}
    </div>
  );
}
