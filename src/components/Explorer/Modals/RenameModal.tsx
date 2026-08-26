"use client";

import { useEffect, useState } from "react";
import { Edit3, X } from "lucide-react";
import type { FSNode } from "@/types/filesystem";

export function RenameModal({
  isOpen,
  nodeId,
  nodes,
  onClose,
  onRename,
}: {
  isOpen: boolean;
  nodeId: string | null;
  nodes: FSNode[];
  onClose: () => void;
  onRename: (nodeId: string, newName: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const targetNode = nodes.find((n) => n.id === nodeId);

  useEffect(() => {
    if (isOpen && targetNode) {
      setName(targetNode.name);
      setError(null);
    }
  }, [isOpen, targetNode]);

  if (!isOpen || !targetNode) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a valid name.");
      return;
    }
    try {
      await onRename(targetNode.id, name);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to rename");
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-head">
          <h3>
            <Edit3 size={18} /> Rename {targetNode.type === "file" ? "File" : "Folder"}
          </h3>
          <button onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <label>
              New Name:
              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
              />
            </label>
            {error && <p className="modal-error">{error}</p>}
          </div>
          <div className="modal-foot">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Rename
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
