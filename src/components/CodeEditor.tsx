"use client";

import Editor, { type Monaco } from "@monaco-editor/react";
import { Copy, RotateCcw } from "lucide-react";
import { useEffect, useRef } from "react";

export function CodeEditor({ value, onChange, activeLine, onReset }: { value: string; onChange: (value: string) => void; activeLine?: number; onReset: () => void }) {
  const editorRef = useRef<Parameters<NonNullable<React.ComponentProps<typeof Editor>["onMount"]>>[0] | null>(null);
  const decorations = useRef<string[]>([]);
  useEffect(() => {
    if (!editorRef.current) return;
    decorations.current = editorRef.current.deltaDecorations(decorations.current, activeLine ? [{ range: { startLineNumber: activeLine, startColumn: 1, endLineNumber: activeLine, endColumn: 1 }, options: { isWholeLine: true, className: "execution-line", glyphMarginClassName: "execution-glyph" } }] : []);
    if (activeLine) editorRef.current.revealLineInCenterIfOutsideViewport(activeLine);
  }, [activeLine]);
  const beforeMount = (monaco: Monaco) => monaco.editor.defineTheme("visualizer", { base: "vs-dark", inherit: true, rules: [], colors: { "editor.background": "#0b1019", "editorLineNumber.foreground": "#485368", "editorLineNumber.activeForeground": "#9aa8be", "editor.selectionBackground": "#754cff44" } });
  return <section className="panel editor-panel">
    <div className="panel-head"><div><span className="eyebrow">SOURCE</span><h2>JavaScript</h2></div><div className="icon-actions"><button onClick={() => navigator.clipboard.writeText(value)} title="Copy code"><Copy size={16} /></button><button onClick={onReset} title="Reset example"><RotateCcw size={16} /></button></div></div>
    <div className="editor-wrap"><Editor beforeMount={beforeMount} onMount={(editor) => { editorRef.current = editor; }} theme="visualizer" language="javascript" value={value} onChange={(next) => onChange(next ?? "")} options={{ minimap: { enabled: false }, fontSize: 14, lineHeight: 24, fontFamily: "var(--font-mono)", padding: { top: 18 }, glyphMargin: true, scrollBeyondLastLine: false, automaticLayout: true, tabSize: 2 }} /></div>
  </section>;
}
