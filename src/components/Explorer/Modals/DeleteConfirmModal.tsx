"use client";

import { AlertTriangle, X } from "lucide-react";
import type { FSNode } from "@/types/filesystem";

export function DeleteConfirmModal({
  isOpen,
  nodeId,
  nodes,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  nodeId: string | null;
  nodes: FSNode[];
  onClose: () => void;
  onConfirm: (nodeId: string) => Promise<void>;
}) {
  if (!isOpen || !nodeId) return null;

  const targetNode = nodes.find((n) => n.id === nodeId);
  if (!targetNode) return null;

  const childCount =
    targetNode.type === "folder" ? nodes.filter((n) => n.parentId === targetNode.id).length : 0;

  const handleConfirm = async () => {
    await onConfirm(nodeId);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card modal-danger">
        <div className="modal-head">
          <h3>
            <AlertTriangle size={18} /> Delete {targetNode.type === "file" ? "File" : "Folder"}?
          </h3>
          <button onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">
          <p>
            Are you sure you want to delete <strong>"{targetNode.name}"</strong>?
          </p>
          {targetNode.type === "folder" && childCount > 0 && (
            <p className="warning-text">
              This folder contains {childCount} item(s) which will also be deleted.
            </p>
          )}
          <small className="modal-subtext">This action cannot be undone.</small>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-danger" onClick={handleConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
