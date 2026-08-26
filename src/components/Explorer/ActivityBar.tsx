"use client";

import { Files, Maximize2, Minimize2 } from "lucide-react";

export function ActivityBar({
  isSidebarOpen,
  isFullscreen,
  onToggleSidebar,
  onToggleFullscreen,
}: {
  isSidebarOpen: boolean;
  isFullscreen?: boolean;
  onToggleSidebar: () => void;
  onToggleFullscreen?: () => void;
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

      {onToggleFullscreen && (
        <button
          className="activity-btn activity-bottom-btn"
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen (100% Full-Bleed)"}
          aria-label="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      )}
    </div>
  );
}
