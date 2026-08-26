"use client";

import { Clock, FileCode } from "lucide-react";
import type { FileNode, FSNode, RecentFileRecord } from "@/types/filesystem";

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 45) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 45) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 22) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export function RecentFiles({
  recents,
  nodes,
  activeFileId,
  onOpenFile,
}: {
  recents: RecentFileRecord[];
  nodes: FSNode[];
  activeFileId: string | null;
  onOpenFile: (file: FileNode) => void;
}) {
  const recentFiles = recents
    .map((r) => {
      const file = nodes.find((n) => n.id === r.fileId && n.type === "file") as FileNode | undefined;
      return file ? { file, openedAt: r.openedAt } : null;
    })
    .filter(Boolean) as { file: FileNode; openedAt: number }[];

  if (recentFiles.length === 0) return null;

  return (
    <div className="explorer-section">
      <div className="section-title">
        <Clock size={13} /> RECENT
      </div>
      <div className="section-list">
        {recentFiles.slice(0, 5).map(({ file, openedAt }) => (
          <button
            key={file.id}
            className={`recent-item ${activeFileId === file.id ? "active" : ""}`}
            onClick={() => onOpenFile(file)}
          >
            <FileCode size={14} className="file-icon" />
            <span className="file-name">{file.name}</span>
            <span className="time-badge">{formatRelativeTime(openedAt)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
