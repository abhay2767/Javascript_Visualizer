"use client";

import { useMemo, useState, useEffect } from "react";
import { Code2, Maximize2, Minimize2, Moon, Play, Sparkles, Sun, TriangleAlert } from "lucide-react";
import { CodeEditor } from "./CodeEditor";
import { EditorToolbar } from "./EditorToolbar";
import { ActivityBar } from "./Explorer/ActivityBar";
import { ExplorerSidebar } from "./Explorer/ExplorerSidebar";
import { CreateFileModal } from "./Explorer/Modals/CreateFileModal";
import { CreateFolderModal } from "./Explorer/Modals/CreateFolderModal";
import { DeleteConfirmModal } from "./Explorer/Modals/DeleteConfirmModal";
import { RenameModal } from "./Explorer/Modals/RenameModal";
import { SaveAsModal } from "./Explorer/Modals/SaveAsModal";
import { PlaybackControls } from "./PlaybackControls";
import { Timeline } from "./Timeline";
import { ArrayPanel, ComplexityPanel, ConsolePanel, StepCard, VariablePanel } from "./VisualPanels";
import { interpret } from "@/engine/interpreter";
import { examples } from "@/examples/forLoopExamples";
import { useEditorSession } from "@/hooks/useEditorSession";
import { useFileSystem } from "@/hooks/useFileSystem";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { usePlayback } from "@/hooks/usePlayback";
import type { FileNode } from "@/types/filesystem";

export function VisualizerApp() {
  const fs = useFileSystem();

  const {
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
  } = useEditorSession(fs.nodes, fs.updateFileContent, fs.recordRecent);

  const [activeExampleIndex, setActiveExampleIndex] = useState<number | null>(0);
  const [dark, setDark] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFSChange);
    return () => document.removeEventListener("fullscreenchange", handleFSChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Modals state
  const [modalFileFolderId, setModalFileFolderId] = useState<string | null>(null);
  const [isCreateFileOpen, setIsCreateFileOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [renameNodeId, setRenameNodeId] = useState<string | null>(null);
  const [deleteNodeId, setDeleteNodeId] = useState<string | null>(null);
  const [isSaveAsOpen, setIsSaveAsOpen] = useState(false);

  // AST interpreter result
  const [result, setResult] = useState(() => interpret(examples[0].code));
  const playback = usePlayback(result.steps.length);
  const step = result.steps[playback.current];

  // Run/Visualize handler
  const handleRunVisualize = () => {
    const next = interpret(activeCode);
    setResult(next);
    playback.restart();
  };

  // Open User File handler
  const handleOpenFile = async (file: FileNode) => {
    setActiveExampleIndex(null);
    await openFile(file);
    const next = interpret(file.content);
    setResult(next);
    playback.restart();
  };

  // Select Preset Example handler
  const handleSelectExample = (index: number) => {
    setActiveExampleIndex(index);
    setActiveFileId(null);
    const exCode = examples[index].code;
    setActiveCode(exCode);
    setSavedCode(exCode);
    const next = interpret(exCode);
    setResult(next);
    playback.restart();
  };

  // Save File handler (Ctrl+S or Save Button)
  const handleSave = async () => {
    const { saved, isUnsavedScratch } = await saveActiveFile();
    if (isUnsavedScratch) {
      setIsSaveAsOpen(true);
    }
  };

  // Save As handler (Ctrl+Shift+S)
  const handleSaveAsSubmit = async (fileName: string, folderId: string | null) => {
    const { file, error } = await fs.createFile(fileName, folderId, activeCode);
    if (error) throw new Error(error);
    if (file) {
      setActiveExampleIndex(null);
      await openFile(file, activeCode);
      showToast(`Saved as ${file.name}`);
    }
  };

  // Register keyboard shortcuts (Ctrl+S, Ctrl+Shift+S, Ctrl+B)
  useKeyboardShortcuts({
    onSave: handleSave,
    onSaveAs: () => setIsSaveAsOpen(true),
    onToggleSidebar: () => setIsSidebarOpen((v) => !v),
  });

  const progress = result.steps.length ? ((playback.current + 1) / result.steps.length) * 100 : 0;
  const stats = useMemo(
    () => ({
      loops: result.steps.filter((item) => item.type === "loop-complete").length,
      outputs: step?.output.length ?? 0,
    }),
    [result.steps, step]
  );

  const maxLoopDepth = useMemo(
    () => (result.steps.length ? Math.max(...result.steps.map((s) => s.loopDepth)) : 0),
    [result.steps]
  );

  const activeFileName = activeFile
    ? activeFile.name
    : activeExampleIndex !== null
    ? `${examples[activeExampleIndex].name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.js`
    : "untitled.js";

  return (
    <main className={`app ${dark ? "dark" : "light"} ${isFullscreen ? "fullscreen-mode" : ""}`}>
      {/* Top Navigation Bar */}
      <header className="topbar">
        <a className="brand" href="#">
          <span>
            <Code2 size={21} />
          </span>
          <div>
            JavaScript <strong>Visualizer</strong>
          </div>
          <em>IDE</em>
        </a>
        <div className="header-actions">
          <button
            className="theme-toggle"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen (100% Full-Bleed)"}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>
          <button
            className="theme-toggle"
            onClick={() => setDark((v) => !v)}
            aria-label="Toggle theme"
          >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button className="visualize" onClick={handleRunVisualize}>
            <Play size={16} fill="currentColor" /> Visualize
          </button>
        </div>
      </header>

      {/* Main Workspace with VS Code Activity Bar + Explorer Sidebar + Editor + Visualizer */}
      <div className={`workspace-wrapper ${isSidebarOpen ? "sidebar-open" : "sidebar-collapsed"}`}>
        {/* VS Code Far-Left Activity Bar */}
        <ActivityBar
          isSidebarOpen={isSidebarOpen}
          isFullscreen={isFullscreen}
          onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
          onToggleFullscreen={toggleFullscreen}
        />

        {/* Desktop Sidebar */}
        <ExplorerSidebar
          isOpen={isSidebarOpen}
          nodes={fs.nodes}
          recents={fs.recents}
          expandedFolders={fs.expandedFolders}
          searchQuery={fs.searchQuery}
          activeFileId={activeFileId}
          activeExampleIndex={activeExampleIndex}
          isDirty={isDirty}
          onSearchChange={fs.setSearchQuery}
          onToggleFolder={fs.toggleFolder}
          onOpenFile={handleOpenFile}
          onSelectExample={handleSelectExample}
          onCreateFile={async (name, pId) => {
            const { file, error } = await fs.createFile(name, pId);
            if (error) throw new Error(error);
            if (file) handleOpenFile(file);
          }}
          onCreateFolder={async (name, pId) => {
            const { error } = await fs.createFolder(name, pId);
            if (error) throw new Error(error);
          }}
          onRenameNode={async (id, name) => {
            const { error } = await fs.renameNode(id, name);
            if (error) throw new Error(error);
          }}
          onDeleteNode={fs.deleteNode}
          onOpenCreateFileModal={(pId) => {
            setModalFileFolderId(pId);
            setIsCreateFileOpen(true);
          }}
          onOpenCreateFolderModal={(pId) => {
            setModalFileFolderId(pId);
            setIsCreateFolderOpen(true);
          }}
          onOpenRenameModal={setRenameNodeId}
          onOpenDeleteModal={setDeleteNodeId}
        />

        {/* Mobile Drawer Sidebar */}
        {isMobileDrawerOpen && (
          <ExplorerSidebar
            isOpen={true}
            isMobileDrawer={true}
            nodes={fs.nodes}
            recents={fs.recents}
            expandedFolders={fs.expandedFolders}
            searchQuery={fs.searchQuery}
            activeFileId={activeFileId}
            activeExampleIndex={activeExampleIndex}
            isDirty={isDirty}
            onSearchChange={fs.setSearchQuery}
            onToggleFolder={fs.toggleFolder}
            onOpenFile={handleOpenFile}
            onSelectExample={handleSelectExample}
            onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)}
            onCreateFile={async (name, pId) => {
              const { file, error } = await fs.createFile(name, pId);
              if (error) throw new Error(error);
              if (file) handleOpenFile(file);
            }}
            onCreateFolder={async (name, pId) => {
              const { error } = await fs.createFolder(name, pId);
              if (error) throw new Error(error);
            }}
            onRenameNode={async (id, name) => {
              const { error } = await fs.renameNode(id, name);
              if (error) throw new Error(error);
            }}
            onDeleteNode={fs.deleteNode}
            onOpenCreateFileModal={(pId) => {
              setModalFileFolderId(pId);
              setIsCreateFileOpen(true);
            }}
            onOpenCreateFolderModal={(pId) => {
              setModalFileFolderId(pId);
              setIsCreateFolderOpen(true);
            }}
            onOpenRenameModal={setRenameNodeId}
            onOpenDeleteModal={setDeleteNodeId}
          />
        )}

        {/* Editor & Visualizer Main Column */}
        <section className="main-content">
          <EditorToolbar
            activeFileName={activeFileName}
            isDirty={isDirty}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
            onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
            onSave={handleSave}
            onRun={handleRunVisualize}
            toast={toast}
          />

          <div className="workspace">
            <CodeEditor
              value={activeCode}
              onChange={setActiveCode}
              activeLine={step?.line}
              onReset={() => {
                if (activeExampleIndex !== null) handleSelectExample(activeExampleIndex);
                else if (activeFile) setActiveCode(activeFile.content);
              }}
            />

            <div className="visual-side">
              <div className="visual-head">
                <div>
                  <span className="eyebrow">VISUALIZATION</span>
                  <h2>Runtime explorer</h2>
                </div>
                <div className="runtime-stats">
                  <span>
                    <b>{stats.loops}</b> loops
                  </span>
                  <span>
                    <b>{stats.outputs}</b> outputs
                  </span>
                </div>
              </div>

              {result.error ? (
                <div className="error-panel">
                  <TriangleAlert size={26} />
                  <div>
                    <span>
                      {result.error.kind === "syntax" ? "JavaScript Error" : "Unsupported syntax"}
                    </span>
                    <h2>{result.error.message}</h2>
                    {result.error.line && (
                      <p>
                        Line {result.error.line}, column {result.error.column}
                      </p>
                    )}
                    <small>Please fix the code and try again.</small>
                  </div>
                </div>
              ) : step ? (
                <>
                  <ComplexityPanel
                    preset={activeExampleIndex !== null ? examples[activeExampleIndex] : null}
                    stepsCount={result.steps.length}
                    maxLoopDepth={maxLoopDepth}
                  />
                  <StepCard step={step} />
                  <div className="panel-grid">
                    <VariablePanel step={step} />
                    <ArrayPanel step={step} />
                  </div>
                  <ConsolePanel output={step.output} />
                </>
              ) : (
                <div className="empty-state">
                  <Code2 size={32} />
                  <h2>Ready to explore</h2>
                  <p>Edit the code, then press Visualize.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Transport Player & Timeline Footer */}
      {!result.error && (
        <>
          <Timeline steps={result.steps} current={playback.current} onSelect={playback.setCurrent} />
          <div className="progress">
            <span style={{ width: `${progress}%` }} />
          </div>
          <PlaybackControls
            current={playback.current}
            total={result.steps.length}
            playing={playback.playing}
            speed={playback.speed}
            onCurrent={playback.setCurrent}
            onPlaying={playback.setPlaying}
            onSpeed={playback.setSpeed}
            onRestart={playback.restart}
          />
        </>
      )}

      {/* Modals */}
      <CreateFileModal
        isOpen={isCreateFileOpen}
        targetFolderId={modalFileFolderId}
        nodes={fs.nodes}
        onClose={() => setIsCreateFileOpen(false)}
        onCreate={async (name, pId) => {
          const { file, error } = await fs.createFile(name, pId);
          if (error) throw new Error(error);
          if (file) handleOpenFile(file);
        }}
      />

      <CreateFolderModal
        isOpen={isCreateFolderOpen}
        targetFolderId={modalFileFolderId}
        nodes={fs.nodes}
        onClose={() => setIsCreateFolderOpen(false)}
        onCreate={async (name, pId) => {
          const { error } = await fs.createFolder(name, pId);
          if (error) throw new Error(error);
        }}
      />

      <RenameModal
        isOpen={!!renameNodeId}
        nodeId={renameNodeId}
        nodes={fs.nodes}
        onClose={() => setRenameNodeId(null)}
        onRename={async (id, name) => {
          const { error } = await fs.renameNode(id, name);
          if (error) throw new Error(error);
        }}
      />

      <DeleteConfirmModal
        isOpen={!!deleteNodeId}
        nodeId={deleteNodeId}
        nodes={fs.nodes}
        onClose={() => setDeleteNodeId(null)}
        onConfirm={async (id) => {
          await fs.deleteNode(id);
          if (id === activeFileId) handleSelectExample(0);
        }}
      />

      <SaveAsModal
        isOpen={isSaveAsOpen}
        currentCode={activeCode}
        defaultName={activeFileName}
        nodes={fs.nodes}
        onClose={() => setIsSaveAsOpen(false)}
        onSaveAs={handleSaveAsSubmit}
      />
    </main>
  );
}
