import { useEffect } from "react";

export function useKeyboardShortcuts({
  onSave,
  onSaveAs,
}: {
  onSave: () => void;
  onSaveAs: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      if (ctrlOrCmd && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (e.shiftKey) {
          onSaveAs();
        } else {
          onSave();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSave, onSaveAs]);
}
