"use client";

import { Check, Code2, Eye, FileCode, Layers, Menu, PanelLeftClose, PanelLeftOpen, Play, Save } from "lucide-react";
import type { ToastMessage } from "@/hooks/useEditorSession";

export function EditorToolbar({
  activeFileName,
  isDirty,
  isSidebarOpen,
  mobileView,
  onToggleSidebar,
  onOpenMobileDrawer,
  onSelectMobileView,
  onSave,
  onRun,
  toast,
}: {
  activeFileName: string;
  isDirty: boolean;
  isSidebarOpen: boolean;
  mobileView: "code" | "visualizer" | "both";
  onToggleSidebar: () => void;
  onOpenMobileDrawer: () => void;
  onSelectMobileView: (view: "code" | "visualizer" | "both") => void;
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

        {/* Mobile View Switcher (Code / Visualizer / Both) */}
        <div className="mobile-view-tabs mobile-only">
          <button
            className={`tab-btn ${mobileView === "code" ? "active" : ""}`}
            onClick={() => onSelectMobileView("code")}
            title="Show Code Editor"
          >
            <Code2 size={13} />
            <span>Code</span>
          </button>
          <button
            className={`tab-btn ${mobileView === "visualizer" ? "active" : ""}`}
            onClick={() => onSelectMobileView("visualizer")}
            title="Show Visualizer"
          >
            <Eye size={13} />
            <span>Visual</span>
          </button>
          <button
            className={`tab-btn ${mobileView === "both" ? "active" : ""}`}
            onClick={() => onSelectMobileView("both")}
            title="Show Both Stacked"
          >
            <Layers size={13} />
            <span>Both</span>
          </button>
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
