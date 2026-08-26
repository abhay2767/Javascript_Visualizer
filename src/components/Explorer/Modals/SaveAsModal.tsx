"use client";

import { useEffect, useState } from "react";
import { Save, X } from "lucide-react";
import type { FolderNode, FSNode } from "@/types/filesystem";

export function SaveAsModal({
  isOpen,
  currentCode,
  defaultName,
  nodes,
  onClose,
  onSaveAs,
}: {
  isOpen: boolean;
  currentCode: string;
  defaultName?: string;
  nodes: FSNode[];
  onClose: () => void;
  onSaveAs: (fileName: string, folderId: string | null) => Promise<void>;
}) {
  const [name, setName] = useState(defaultName || "my-code.js");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(defaultName ? (defaultName.endsWith(".js") ? defaultName : `${defaultName}.js`) : "my-code.js");
      setError(null);
    }
  }, [isOpen, defaultName]);

  if (!isOpen) return null;

  const folders = nodes.filter((n) => n.type === "folder") as FolderNode[];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a valid file name.");
      return;
    }
    try {
      await onSaveAs(name, selectedFolderId);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save file");
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-head">
          <h3>
            <Save size={18} /> Save File As
          </h3>
          <button onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <label>
              File Name:
              <input
                type="text"
                autoFocus
                placeholder="my-code.js"
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
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
