import { useCallback, useState } from "react";
import type { FileNode, FSNode } from "@/types/filesystem";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  text: string;
}

export function useEditorSession(
  nodes: FSNode[],
  updateFileContent: (id: string, content: string) => Promise<void>,
  recordRecent: (id: string) => Promise<void>
) {
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [activeCode, setActiveCode] = useState<string>("");
  const [savedCode, setSavedCode] = useState<string>("");
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((text: string, type: ToastMessage["type"] = "success") => {
    const id = Date.now().toString();
    setToast({ id, type, text });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 2800);
  }, []);

  const activeFile = nodes.find((n) => n.id === activeFileId && n.type === "file") as FileNode | undefined;
  const isDirty = activeFile ? activeCode !== savedCode : false;

  const openFile = useCallback(
    async (file: FileNode, initialContent?: string) => {
      setActiveFileId(file.id);
      const content = initialContent ?? file.content;
      setActiveCode(content);
      setSavedCode(content);
      await recordRecent(file.id);
    },
    [recordRecent]
  );

  const saveActiveFile = useCallback(
    async (): Promise<{ saved: boolean; isUnsavedScratch?: boolean }> => {
      if (!activeFileId || !activeFile) {
        return { saved: false, isUnsavedScratch: true };
      }

      await updateFileContent(activeFileId, activeCode);
      setSavedCode(activeCode);
      showToast(`Saved ${activeFile.name}`);
      return { saved: true };
    },
    [activeFileId, activeFile, activeCode, updateFileContent, showToast]
  );

  return {
    activeFileId,
    activeFile,
    activeCode,
    setActiveCode,
    isDirty,
    openFile,
    saveActiveFile,
    toast,
    showToast,
    setActiveFileId,
    setSavedCode,
  };
}
