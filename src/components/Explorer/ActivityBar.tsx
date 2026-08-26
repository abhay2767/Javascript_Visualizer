"use client";

import { Files, FolderTree, PanelLeftClose, PanelLeftOpen } from "lucide-react";

export function ActivityBar({
  isSidebarOpen,
  onToggleSidebar,
}: {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}) {
  return (
    <div className="activity-bar desktop-only">
      <button
        className={`activity-btn ${isSidebarOpen ? "active" : ""}`}
        onClick={onToggleSidebar}
        title={isSidebarOpen ? "Hide Explorer (Ctrl+B)" : "Show Explorer (Ctrl+B)"}
        aria-label="Toggle Explorer Sidebar"
      >
        <Files size={20} />
        {isSidebarOpen && <span className="active-indicator" />}
      </button>
    </div>
  );
}
