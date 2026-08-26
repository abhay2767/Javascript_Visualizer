"use client";

import { useEffect, useState } from "react";
import { FileCode, X } from "lucide-react";
import type { FolderNode, FSNode } from "@/types/filesystem";

export function CreateFileModal({
  isOpen,
  targetFolderId,
  nodes,
  onClose,
  onCreate,
}: {
  isOpen: boolean;
  targetFolderId: string | null;
  nodes: FSNode[];
  onClose: () => void;
  onCreate: (fileName: string, folderId: string | null) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(targetFolderId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setSelectedFolderId(targetFolderId);
      setError(null);
    }
  }, [isOpen, targetFolderId]);

  if (!isOpen) return null;

  const folders = nodes.filter((n) => n.type === "folder") as FolderNode[];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a file name.");
      return;
    }
    try {
      await onCreate(name, selectedFolderId);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create file");
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-head">
          <h3>
            <FileCode size={18} /> Create New File
          </h3>
          <button onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <label>
              File Name (Only .js supported):
              <input
                type="text"
                autoFocus
                placeholder="e.g. bubble-sort.js"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
              />
            </label>
            <label>
              Save Location:
              <select
                value={selectedFolderId || ""}
                onChange={(e) => setSelectedFolderId(e.target.value || null)}
              >
                <option value="">📁 My Files (Root)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    📁 {f.name}
                  </option>
                ))}
              </select>
            </label>
            {error && <p className="modal-error">{error}</p>}
          </div>
          <div className="modal-foot">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create File
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
