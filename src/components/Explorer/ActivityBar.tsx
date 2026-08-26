"use client";

import { Files, Maximize2, Minimize2 } from "lucide-react";

export function ActivityBar({
  isSidebarOpen,
  isFullscreen,
  onToggleSidebar,
  onOpenMobileDrawer,
  onToggleFullscreen,
}: {
  isSidebarOpen: boolean;
  isFullscreen?: boolean;
  onToggleSidebar: () => void;
  onOpenMobileDrawer?: () => void;
  onToggleFullscreen?: () => void;
}) {
  const handleClick = () => {
    if (typeof window !== "undefined" && window.innerWidth <= 900 && onOpenMobileDrawer) {
      onOpenMobileDrawer();
    } else {
      onToggleSidebar();
    }
  };

  return (
    <div className="activity-bar desktop-only">
      <button
        className={`activity-btn ${isSidebarOpen ? "active" : ""}`}
        onClick={handleClick}
        title="Toggle Explorer"
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
