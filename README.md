# ⚡ JavaScript Code Visualizer

An interactive, production-quality developer education platform built with **Next.js**, **TypeScript**, **Monaco Editor**, and **Tailwind CSS**. 

Instead of pre-rendered algorithm animations, **JavaScript Code Visualizer** performs real-time client-side **Abstract Syntax Tree (AST)** parsing and sandboxed interpretation to step through arbitrary JavaScript code line-by-line.

---

## 🌐 Live Demo & Testing

🔗 **[https://javascript-visualizer-git-main-abhay-dubeys-projects-4d07a25d.vercel.app/](https://javascript-visualizer-git-main-abhay-dubeys-projects-4d07a25d.vercel.app/)**

Try out live code execution, loop flow step-throughs, array element mutations, and variable inspection online!

---

## 🚀 Key Features

- **⚡ Sandboxed AST Interpreter Engine**: Safe client-side code execution using `acorn` (no unsafe `eval()` or `new Function()`).
- **📝 Monaco Code Editor**: Line numbers, syntax highlighting, and live execution-line highlighting markers.
- **🧠 Memory & Variables Panel**: Dynamic state inspection with variable values and value change indicators (`i: 0 → 1`).
- **📊 Interactive Array Visualizer**: Array element indexing boxes with active pointer arrows (`↓ arr[i]`) and in-place mutation highlights.
- **🔀 All JS Loop Flows Supported**:
  - `for` loops (forward & reverse)
  - `while` loops
  - `do...while` loops
  - `for...of` loops
  - `for...in` loops
  - `break` & `continue` statements
  - `if` / `else if` / `else` conditional branching
- **⚡ Functions & Scope**: `FunctionDeclaration`, `FunctionExpression`, Arrow Functions, and pass-by-reference array parameters.
- **🧮 Math & Standard Utilities**: Native support for `Math.floor`, `Math.ceil`, `Math.abs`, `Math.max`, `Math.min`, `parseInt`, `parseFloat`, `arr.slice`, `arr.push`, and `console.log()`.
- **⏱️ Transport & Speed Controls**: Play/Pause, Step Next/Prev, Restart, Step Timeline Slider, and Speed Selectors (0.5x, 1x, 1.5x, 2x).

---

## 🏗️ Architecture & Execution Flow

```text
┌────────────────────────┐
│  JavaScript Source     │  User pastes code into Monaco Editor
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│  Acorn AST Parser      │  Parses source into JavaScript ESTree AST
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ Sandboxed AST          │  Traverses AST nodes step-by-step, evaluating
│ Interpreter Engine     │  expressions and producing immutable state snapshots
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│  ExecutionStep[] (IR)  │  Intermediate Representation containing:
│                        │  • line / column location   • variables snapshot
│                        │  • array states             • active array index
│                        │  • console outputs          • human explanation
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ Visualizer State Store │  Single source of truth via `usePlayback` hook
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ UI Components         │  • CodeEditor (Monaco line marker)
│                        │  • StepCard & Explanation Panel
│                        │  • Variable & Array Memory Panels
│                        │  • Console Panel & Playback Controls
└────────────────────────┘
```

---

## 📁 Project Structure

```text
javascript-code-visualizer/
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root app layout & fonts
│   │   ├── page.tsx           # Main page entry
│   │   └── globals.css        # DevTool styling tokens & glassmorphism theme
│   ├── components/
│   │   ├── CodeEditor.tsx     # Monaco Editor wrapper with line decorations
│   │   ├── VisualizerApp.tsx  # Main state orchestration component
│   │   ├── VisualPanels.tsx   # StepCard, VariablePanel, ArrayPanel, ConsolePanel
│   │   ├── PlaybackControls.tsx # Transport bar (play, pause, next, prev, speed)
│   │   └── Timeline.tsx       # Horizontal step sequence bar
│   ├── engine/
│   │   ├── interpreter.ts     # Core AST walker & step generation engine
│   │   └── interpreter.test.ts # Vitest unit test suite
│   ├── examples/
│   │   └── forLoopExamples.ts # Built-in code presets (Count to 5, Move Zeroes, Merge Sorted, etc.)
│   ├── hooks/
│   │   └── usePlayback.ts     # Transport timer & step playback state hook
│   └── types/
│       └── execution.ts       # Type definitions for ExecutionStep, StepType, VisualValue
├── package.json
└── tsconfig.json
```

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm**

### Installation & Local Setup

```bash
# Clone the repository
git clone https://github.com/abhay2767/Javascript_Visualizer.git

# Navigate into project directory
cd Javascript_Visualizer

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the app!

---

## 🧪 Testing & Validation

Run unit tests:

```bash
npm test
```

Run TypeScript compilation check:

```bash
npm run typecheck
```

Build production bundle:

```bash
npm run build
```

---

## 🤝 Extending the Engine for New Language Constructs

The execution engine in `src/engine/interpreter.ts` is modular. To add support for new JavaScript constructs (e.g. `switch...case` or `Object.keys()`):

1. **Add new `StepType` in `src/types/execution.ts`** if a new step visualization category is needed.
2. **Add AST node handler in `src/engine/interpreter.ts`**:
   - In `evaluate(node)` for expressions.
   - In `executeStatement(node, depth)` for statements.
3. **Add unit test in `src/engine/interpreter.test.ts`** to verify step snapshot correctness.

---

## 📄 License

MIT License. Built for developer education and computer science algorithm visualization.
