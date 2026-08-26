# 📜 PROJECT CONTEXT & MASTER SPECIFICATION
> **JavaScript Code Execution Visualizer**
> *Maintain this file in the project repository as an up-to-date context reference for AI assistants (ChatGPT, Claude, Gemini, Antigravity, Cursor) and developers.*

---

## 📌 1. Project Overview & Vision

**JavaScript Code Visualizer** is a production-quality, developer-education web application built with **Next.js**, **TypeScript**, **React**, **Tailwind CSS**, and **Monaco Editor**.

### Core Concept:
> A user writes or opens JavaScript code in an IDE-like interface, clicks "Run / Visualize", and the application parses, executes, and steps through the code in real-time—visually showing variables changing, arrays mutating, loop conditions evaluating, and console outputs accumulating.

Includes a **VS Code-style File Explorer & Virtual File System (IndexedDB)** for organizing `.js` files, nested folders, recent files, and preset template examples across browser sessions without requiring any backend.

---

## 🔗 2. Repository & Live Deployment Links

- **GitHub Repository**: [https://github.com/abhay2767/Javascript_Visualizer](https://github.com/abhay2767/Javascript_Visualizer)
- **Live Production URL (Vercel)**: [https://javascript-visualizer-git-main-abhay-dubeys-projects-4d07a25d.vercel.app/](https://javascript-visualizer-git-main-abhay-dubeys-projects-4d07a25d.vercel.app/)

---

## 🛠️ 3. Technology Stack

- **Framework**: Next.js 15 (App Router) + React 19
- **Language**: TypeScript 5.7
- **Storage**: Client-side IndexedDB (`js_visualizer_fs_v1`)
- **Styling**: Tailwind CSS + Custom DevTool Dark/Light Theme (`src/app/globals.css`)
- **Code Editor**: `@monaco-editor/react` v4.7.0 (with dynamic line highlight decorations)
- **AST Parser**: `acorn` v8.15.0 (client-side ESTree AST parsing)
- **Icons**: `lucide-react`
- **Testing**: `vitest` v2.1.8

---

## 📐 4. Architecture & Data Flow

```text
┌────────────────────────┐
│  IndexedDB / Storage   │  Virtual File System (Files, Folders, Recent Files)
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│  Monaco Code Editor    │  Session tracking (`isDirty` asterisk, Ctrl+S / Cmd+S save)
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│  Acorn AST Parser      │  Parses current editor source code into ESTree AST
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ Sandboxed AST          │  `src/engine/interpreter.ts` walks AST nodes,
│ Step Interpreter       │  evaluates expressions, tracks scope & references
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ ExecutionStep[] (IR)   │  Generates array of immutable step snapshots containing:
│                        │  • line / column AST location
│                        │  • variables state snapshot
│                        │  • arrays state & active index
│                        │  • console logs snapshot
│                        │  • human-readable explanation & condition result
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ Visual UI Components   │  • VS Code Explorer Sidebar (Desktop & Mobile Drawer)
│                        │  • EditorToolbar (Save, Run / Visualize, Toast)
│                        │  • StepCard & Human Explanation Panel
│                        │  • VariablePanel, ArrayPanel, ConsolePanel, Timeline
└────────────────────────┘
```

---

## ✨ 5. Comprehensive Feature Breakdown

### A. Virtual File System & VS Code Explorer
- **IndexedDB Storage**: Local zero-backend virtual filesystem (`nodes`, `recents` stores).
- **Enforced File Extensions**: Only `.js` extensions allowed for user files (auto-appended if omitted).
- **Folder & Tree Organization**: Support for nested folders, expand/collapse state, creation (`+ File`, `+ Folder`), renaming, and deletion.
- **RECENT Section**: Displays recently opened/saved files with relative timestamps ("Just now", "5m ago", "Yesterday").
- **EXAMPLES Section**: Displays built-in read-only preset examples (`for-loop.js`, `merge-sort.js`, `move-zeroes.js`, etc.).
- **Reactive Search**: Filters user files & folders; auto-expands folders containing matching search results.
- **Context Menus & Actions**: Right-click context menus and `⋯` action menus for files, folders, and root.
- **Collapsible & Responsive**: Desktop collapse button (`[ ▣ ]`) and Mobile slide-in drawer (`☰ Explorer`).

### B. Editor Session & Keyboard Shortcuts
- **Unsaved Changes Tracking**: Visual asterisk (`bubble-sort.js *`) when editor content differs from saved file.
- **`Ctrl + S` / `Cmd + S`**: Saves active user file immediately or opens **Save As** modal if unsaved.
- **`Ctrl + Shift + S` / `Cmd + Shift + S`**: Opens **Save As** modal to save a copy as a new `.js` file.
- **`▶ Run / Visualize`**: Evaluates current editor code directly through AST interpreter without needing to save first.

### C. Supported Language Constructs & Interpreter Capabilities
- **Variables & Declarations**: `let`, `const`, `var`, primitives (`number`, `string`, `boolean`, `null`, `undefined`).
- **5 Loop Types**: `for` (forward & reverse), `while`, `do...while`, `for...of`, `for...in`.
- **Loop Control**: `break` and `continue` statements.
- **Conditionals**: `if` / `else if` / `else` with condition evaluation highlights (`truthy` / `falsy`).
- **Functions**: `FunctionDeclaration`, `FunctionExpression`, Arrow Functions, custom parameter binding, and return values.
- **Pass-By-Reference Arrays & Indexing**: In-place element assignments (`arr[i] = val`) update array states live in the UI.
### D. Popular DSA Algorithms & Time/Space Complexity Panel
- **Popular DSA Presets**: Built-in interactive code examples for famous algorithms:
  - `01 Bubble Sort`: $O(n^2)$ Time, $O(1)$ Space
  - `02 Binary Search`: $O(\log n)$ Time, $O(1)$ Space
  - `03 Two Sum`: $O(n^2)$ Time, $O(1)$ Space
  - `04 Move Zeroes`: $O(n)$ Time, $O(1)$ Space
  - `05 Fibonacci (DP Iterative)`: $O(n)$ Time, $O(1)$ Space
  - `06 Merge Sorted Arrays`: $O(m + n)$ Time, $O(1)$ Space
  - `07 Reverse String`: $O(n)$ Time, $O(1)$ Space
- **Time & Space Complexity Panel (`ComplexityPanel`)**:
  - Displays Best, Average, and Worst Time Complexity badges (e.g. $O(n^2)$, $O(\log n)$, $O(n)$).
  - Displays Auxiliary Space Complexity badge (e.g. $O(1)$).
  - Displays Total Runtime AST Operation step counts and maximum loop nesting depth.
  - Human-readable expandable breakdown card explaining *why* the loop structure produces its time & space bounds.

---

## 📁 6. Project Directory Map

```text
javascript-code-visualizer/
├── PROJECT_CONTEXT.md         # Master AI context & project specification document
├── README.md                  # Developer README with Live Demo & quickstart guide
├── next.config.ts             # Next.js build configuration (ignoreBuildErrors)
├── eslint.config.mjs          # Flat ESLint configuration
├── package.json               # Node.js dependencies & scripts
├── tsconfig.json              # TypeScript configuration
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Next.js App Router root layout
│   │   ├── page.tsx           # Page entry point
│   │   └── globals.css        # DevTool dark/light theme & Explorer styles
│   ├── components/
│   │   ├── CodeEditor.tsx     # Monaco Editor wrapper with line markers
│   │   ├── EditorToolbar.tsx  # Active file header, Save, Run/Visualize buttons
│   │   ├── VisualizerApp.tsx  # Main state orchestrator component
│   │   ├── VisualPanels.tsx   # StepCard, VariablePanel, ArrayPanel, ConsolePanel
│   │   ├── PlaybackControls.tsx # Transport player bar
│   │   ├── Timeline.tsx       # Horizontal step sequence bar
│   │   └── Explorer/
│   │       ├── ExplorerSidebar.tsx # Main sidebar (desktop panel & mobile drawer)
│   │       ├── FileTree.tsx    # Recursive tree view for user files & folders
│   │       ├── FileTreeItem.tsx# Individual tree row with icons & actions
│   │       ├── ExplorerSearch.tsx # Reactive search input
│   │       ├── RecentFiles.tsx # Recent files list with time badges
│   │       ├── ExamplesSection.tsx # Read-only preset examples section
│   │       ├── ContextMenu.tsx # Right-click context menu
│   │       └── Modals/
│   │           ├── CreateFileModal.tsx
│   │           ├── CreateFolderModal.tsx
│   │           ├── RenameModal.tsx
│   │           ├── DeleteConfirmModal.tsx
│   │           └── SaveAsModal.tsx
│   ├── engine/
│   │   ├── interpreter.ts     # Core Acorn AST walker & step generation engine
│   │   └── interpreter.test.ts # Vitest unit test suite
│   ├── examples/
│   │   └── forLoopExamples.ts # 8 built-in preset code examples
│   ├── hooks/
│   │   ├── useFileSystem.ts   # Tree state, search, and IndexedDB hook
│   │   ├── useEditorSession.ts# Active file, isDirty state, save/toast hook
│   │   ├── useKeyboardShortcuts.ts # Ctrl+S / Cmd+S shortcut hook
│   │   └── usePlayback.ts     # Playback timer & current step hook
│   ├── storage/
│   │   ├── indexedDb.ts       # Low-level IndexedDB wrapper
│   │   └── filesystem.ts      # FileSystem CRUD & seeding service
│   └── types/
│       ├── execution.ts       # ExecutionStep, StepType, VisualValue types
│       └── filesystem.ts      # FileNode, FolderNode, FSNode, ContextMenu types
```

---

## 🧪 7. Verification & Commands

- **Run Dev Server**: `npm run dev`
- **Run Unit Tests**: `npm test` (`vitest run`)
- **Run Typecheck**: `npm run typecheck` (`tsc --noEmit`)
- **Run Production Build**: `npm run build` (`next build`)

---

## 🎯 8. Future Roadmap / Extensibility

1. **Call Stack Panel**: Dedicated 3D multi-frame call stack view for recursive algorithms.
2. **Object & Memory Graph Visualizer**: Visual graph boxes for nested JavaScript objects and references.
3. **Data Structures & Algorithms (DSA)**: Custom views for Trees, Linked Lists, Stacks, Queues, Graphs, and Sorting Algorithms.

---

## 🤖 AI Assistant Usage Guide

If you are an AI assistant helping with this repository:
1. Read this file to understand the entire architecture, supported features, and directory layout.
2. Maintain clean separation between the AST interpreter engine (`src/engine/interpreter.ts`), storage (`src/storage/`), types (`src/types/`), and React components (`src/components/`).
3. **DO NOT run `git push` automatically** unless the user explicitly commands you to push code to GitHub.
4. Always run `npm test`, `npm run typecheck`, and `npm run build` to verify changes before declaring completion.
