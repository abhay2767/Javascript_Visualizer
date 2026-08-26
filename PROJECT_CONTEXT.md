# 📜 PROJECT CONTEXT & MASTER SPECIFICATION
> **JavaScript Code Execution Visualizer**
> *Maintain this file in the project repository as an up-to-date context reference for AI assistants (ChatGPT, Claude, Gemini, Antigravity, Cursor) and developers.*

---

## 📌 1. Project Overview & Vision

**JavaScript Code Visualizer** is a production-quality, developer-education web application built with **Next.js**, **TypeScript**, **React**, **Tailwind CSS**, and **Monaco Editor**.

### Core Concept:
> A user pastes arbitrary JavaScript code into an editor, clicks "Visualize", and the application parses, executes, and steps through the code in real-time—visually showing variables changing, arrays mutating, loop conditions evaluating, and console outputs accumulating.

Unlike standard static algorithm animators (which only support hardcoded algorithms like Bubble Sort), this platform uses a **client-side AST (Abstract Syntax Tree) Interpreter** to dynamically visualize general JavaScript code.

---

## 🔗 2. Repository & Live Deployment Links

- **GitHub Repository**: [https://github.com/abhay2767/Javascript_Visualizer](https://github.com/abhay2767/Javascript_Visualizer)
- **Live Production URL (Vercel)**: [https://javascript-visualizer-git-main-abhay-dubeys-projects-4d07a25d.vercel.app/](https://javascript-visualizer-git-main-abhay-dubeys-projects-4d07a25d.vercel.app/)

---

## 🛠️ 3. Technology Stack

- **Framework**: Next.js 15 (App Router) + React 19
- **Language**: TypeScript 5.7
- **Styling**: Tailwind CSS + Custom DevTool Dark/Light Theme (`src/app/globals.css`)
- **Code Editor**: `@monaco-editor/react` v4.7.0 (with dynamic line highlight decorations)
- **AST Parser**: `acorn` v8.15.0 (client-side ESTree AST parsing)
- **Icons**: `lucide-react`
- **Testing**: `vitest` v2.1.8

---

## 📐 4. Architecture & Data Flow

The project strictly decouples execution analysis from UI rendering. No unsafe `eval()` or `new Function()` is used.

```text
┌────────────────────────┐
│  JavaScript Source     │  User enters JS code in Monaco Editor
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│  Acorn AST Parser      │  Parses JS code into ESTree AST nodes
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
│ Visualizer State Store │  State driven via `usePlayback` hook
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ Visual UI Components   │  • CodeEditor (Monaco line marker)
│                        │  • StepCard & Human Explanation Panel
│                        │  • VariablePanel & ArrayPanel
│                        │  • ConsolePanel & Transport Playback Controls
└────────────────────────┘
```

---

## ✨ 5. Comprehensive Feature Breakdown (Initial + Implemented Enhancements)

### A. Supported Language Constructs & Features
- **Variables & Declarations**: `let`, `const`, `var`, primitive types (`number`, `string`, `boolean`, `null`, `undefined`).
- **All 5 JavaScript Loop Constructs**:
  - `for` loops (forward `i++` and reverse `i--`)
  - `while` loops (`while (condition)`)
  - `do...while` loops (`do { ... } while (condition)`)
  - `for...of` loops (`for (let item of array)`)
  - `for...in` loops (`for (let key in object)`)
- **Loop Control Statements**: `break` (emits `[loop-break]` step) and `continue` (emits `[loop-continue]` step).
- **Conditionals & Branching**: `if` / `else if` / `else` with condition evaluation highlights (`truthy` / `falsy`).
- **Functions & Expressions**:
  - `FunctionDeclaration`: `function foo(params) { ... }`
  - `FunctionExpression`: `var foo = function(params) { ... }`
  - `ArrowFunctionExpression`: `const foo = (params) => { ... }`
  - Custom function invocations with argument parameter binding and `return` values.
- **Pass-By-Reference Arrays & Indexing**:
  - Arrays passed into functions share the underlying array reference.
  - In-place element assignments (`arr[i] = val` / `nums1[i] = nums2[p2]`) update array states live in the UI.
  - Multi-array visualization displays all arrays in scope side-by-side.
- **Built-In Standard Utilities**:
  - **`Math` Object**: `Math.floor`, `Math.ceil`, `Math.round`, `Math.abs`, `Math.max`, `Math.min`, `Math.sqrt`, `Math.pow`, `Math.trunc`.
  - **Global Converters**: `parseInt`, `parseFloat`, `Number`, `String`, `Boolean`, `isNaN`.
  - **Member Expression Methods**: `arr.slice`, `arr.push`, `arr.pop`, `str.split`, `str.charAt`, `str.length`, `arr.length`.
- **Console Terminal**: Simulated dark terminal capturing cumulative `console.log(...)` logs.

### B. User Interface & Controls
- **Monaco Editor**:
  - Syntax highlighting, line numbers, error markers.
  - Glowing line decoration highlighting the currently executing AST statement line.
  - Copy code & Reset code buttons.
- **Playback Controls**:
  - Previous step (`<`), Play/Pause (`▶` / `||`), Next step (`>`), Restart (`|<`).
  - Speed selector: `0.5x`, `1x`, `1.5x`, `2x`.
  - Step counter (`Step 4 / 28`) and interactive horizontal timeline sequence track.
- **Theme Support**: Dark mode (default developer tool aesthetic) and Light mode.
- **Error Handling**: Gracefully catches syntax errors (with line/column pointers) and unsupported constructs without crashing the application.

---

## 📁 6. Project Directory Map

```text
javascript-code-visualizer/
├── PROJECT_CONTEXT.md         # Master AI context & project specification document
├── README.md                  # Developer README with Live Demo & quickstart guide
├── next.config.ts             # Next.js build configuration (ignoreBuildErrors)
├── eslint.config.mjs          # Flat ESLint configuration (custom rules)
├── package.json               # Node.js dependencies & scripts
├── tsconfig.json              # TypeScript configuration
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Next.js App Router root layout
│   │   ├── page.tsx           # Page entry point
│   │   └── globals.css        # Theme variables & visual component styles
│   ├── components/
│   │   ├── CodeEditor.tsx     # Monaco Editor wrapper with line markers
│   │   ├── VisualizerApp.tsx  # Main state orchestrator component
│   │   ├── VisualPanels.tsx   # StepCard, VariablePanel, ArrayPanel, ConsolePanel
│   │   ├── PlaybackControls.tsx # Transport player bar
│   │   └── Timeline.tsx       # Horizontal step dot map
│   ├── engine/
│   │   ├── interpreter.ts     # Core Acorn AST walker & step generation engine
│   │   └── interpreter.test.ts # Vitest unit test suite
│   ├── examples/
│   │   └── forLoopExamples.ts # 8 built-in preset code examples
│   ├── hooks/
│   │   └── usePlayback.ts     # Playback timer & current step hook
│   └── types/
│       └── execution.ts       # ExecutionStep, StepType, VisualValue types
```

---

## 🧪 7. Verification & Commands

- **Run Dev Server**: `npm run dev`
- **Run Unit Tests**: `npm test` (`vitest run`)
- **Run Typecheck**: `npm run typecheck` (`tsc --noEmit`)
- **Run Production Build**: `npm run build` (`next build`)

---

## 🎯 8. Future Roadmap / Extensibility

The decoupled AST architecture (`Source -> AST -> ExecutionStep[] -> State -> UI`) is designed to support future expansions:
1. **Call Stack Panel**: Dedicated 3D multi-frame call stack view for recursive algorithms (e.g. Fibonacci, QuickSort).
2. **Object & Memory Graph Visualizer**: Visual graph boxes for nested JavaScript objects and references.
3. **Data Structures & Algorithms (DSA)**: Custom views for Trees, Linked Lists, Stacks, Queues, Graphs, and Sorting Algorithms (Bubble Sort, Merge Sort).
4. **Scope & Closure Visualizer**: Scope chain inspection (Global, Function, Block scopes).

---

## 🤖 AI Assistant Usage Guide

If you are an AI assistant helping with this repository:
1. Read this file to understand the entire architecture, supported features, and directory layout.
2. Maintain clean separation between the AST interpreter engine (`src/engine/interpreter.ts`), types (`src/types/execution.ts`), and React components (`src/components/`).
3. Always run `npm test` and `npm run build` to verify changes before declaring completion.
