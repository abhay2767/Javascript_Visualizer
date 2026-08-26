"use client";

import { Check, FileCode, Menu, PanelLeftClose, PanelLeftOpen, Play, Save } from "lucide-react";
import type { ToastMessage } from "@/hooks/useEditorSession";

export function EditorToolbar({
  activeFileName,
  isDirty,
  isSidebarOpen,
  onToggleSidebar,
  onOpenMobileDrawer,
  onSave,
  onRun,
  toast,
}: {
  activeFileName: string;
  isDirty: boolean;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenMobileDrawer: () => void;
  onSave: () => void;
  onRun: () => void;
  toast: ToastMessage | null;
}) {
  return (
    <div className="editor-toolbar">
      <div className="toolbar-left">
        <button
          className="icon-btn desktop-only"
          onClick={onToggleSidebar}
          title={isSidebarOpen ? "Collapse Sidebar (Ctrl+B)" : "Expand Sidebar (Ctrl+B)"}
          aria-label="Toggle Sidebar"
        >
          {isSidebarOpen ? <PanelLeftClose size={17} /> : <PanelLeftOpen size={17} />}
        </button>

        <button
          className="mobile-toggle mobile-only"
          onClick={onOpenMobileDrawer}
          aria-label="Open Explorer"
        >
          <Menu size={16} />
          <span>Explorer</span>
        </button>

        <div className="file-active-badge">
          <FileCode size={15} />
          <span className="name">{activeFileName}</span>
          {isDirty && <span className="dirty-star" title="Unsaved changes">*</span>}
        </div>
      </div>

      <div className="toolbar-right">
        {toast && (
          <div className={`toast-chip toast-${toast.type}`}>
            <Check size={13} /> {toast.text}
          </div>
        )}

        <button className="btn-toolbar-save" onClick={onSave} title="Save file (Ctrl+S / Cmd+S)">
          <Save size={15} />
          <span className="desktop-only">Save</span>
        </button>

        <button className="btn-toolbar-run" onClick={onRun} title="Run & Visualize Code">
          <Play size={15} fill="currentColor" />
          <span>Run / Visualize</span>
        </button>
      </div>
    </div>
  );
}
