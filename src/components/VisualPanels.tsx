import { useState } from "react";
import type { ExecutionStep } from "@/types/execution";
import type { ExamplePreset } from "@/examples/forLoopExamples";
import { Braces, Check, ChevronDown, ChevronRight, Cpu, HardDrive, Info, Terminal, X } from "lucide-react";

const show = (value: unknown) =>
  value === undefined ? "undefined" : typeof value === "string" ? `“${value}”` : JSON.stringify(value);

export function StepCard({ step }: { step: ExecutionStep }) {
  return (
    <section className="step-card">
      <div className="step-meta">
        <span className={`type-pill ${step.type}`}>{step.type.replaceAll("-", " ")}</span>
        <span>Line {step.line}</span>
        {step.loopDepth > 0 && <span className="depth">Loop depth {step.loopDepth}</span>}
      </div>
      <h2>{step.title}</h2>
      <p>{step.description}</p>
      {step.evaluation && (
        <div className="evaluation">
          <span>Evaluation</span>
          <code>{step.evaluation}</code>
          <strong className={step.result ? "truthy" : "falsy"}>
            {step.result ? <Check size={16} /> : <X size={16} />}
            {String(step.result)}
          </strong>
        </div>
      )}
      {step.change && (
        <div className="change">
          <span>{step.change.name}</span>
          <code>{show(step.change.from)}</code>
          <ChevronRight size={18} />
          <code className="new-value">{show(step.change.to)}</code>
        </div>
      )}
    </section>
  );
}

export function VariablePanel({ step }: { step: ExecutionStep }) {
  const entries = Object.entries(step.variables).filter(([, value]) => !Array.isArray(value));
  return (
    <section className="mini-panel">
      <div className="mini-title">
        <Braces size={16} /> Variables <span>{entries.length}</span>
      </div>
      {entries.length ? (
        <div className="variables">
          {entries.map(([name, value]) => (
            <div className={`variable ${step.change?.name === name ? "changed" : ""}`} key={name}>
              <code>{name}</code>
              <strong>{show(value)}</strong>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-small">Variables appear as they are created.</p>
      )}
    </section>
  );
}

export function ArrayPanel({ step }: { step: ExecutionStep }) {
  const entries = Object.entries(step.arrays);
  return (
    <section className="mini-panel arrays-panel">
      <div className="mini-title">
        <span className="array-icon">[ ]</span> Arrays <span>{entries.length}</span>
      </div>
      {entries.length ? (
        entries.map(([name, values]) => (
          <div className="array-group" key={name}>
            <code>{name}</code>
            <div className="array-row">
              {values.map((value, index) => (
                <div
                  className={`array-cell ${
                    step.activeArray?.name === name && step.activeArray.index === index ? "active" : ""
                  }`}
                  key={index}
                >
                  <span>{index}</span>
                  <strong>{show(value)}</strong>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p className="empty-small">Array values will be visualized here.</p>
      )}
    </section>
  );
}

export function ConsolePanel({ output }: { output: string[] }) {
  return (
    <section className="mini-panel console-panel">
      <div className="mini-title">
        <Terminal size={16} /> Console <span>{output.length}</span>
      </div>
      <div className="console-body">
        {output.length ? (
          output.map((line, index) => (
            <div key={index}>
              <span>›</span> {line}
            </div>
          ))
        ) : (
          <p>No output yet</p>
        )}
      </div>
    </section>
  );
}

export function ComplexityPanel({
  preset,
  stepsCount,
  maxLoopDepth,
}: {
  preset?: ExamplePreset | null;
  stepsCount: number;
  maxLoopDepth: number;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Dynamic estimation if code is custom or edited
  const timeComp = preset?.timeComplexity || {
    best: maxLoopDepth === 0 ? "O(1)" : maxLoopDepth === 1 ? "O(1)" : `O(n${maxLoopDepth > 2 ? `^${maxLoopDepth - 1}` : ""})`,
    average: maxLoopDepth === 0 ? "O(1)" : maxLoopDepth === 1 ? "O(n)" : `O(n^${maxLoopDepth})`,
    worst: maxLoopDepth === 0 ? "O(1)" : maxLoopDepth === 1 ? "O(n)" : `O(n^${maxLoopDepth})`,
    space: "O(1)",
  };

  const explanation =
    preset?.complexityExplanation ||
    (maxLoopDepth === 0
      ? "Sequential code execution with no loops. Operations run in constant time O(1)."
      : maxLoopDepth === 1
      ? "Single loop structure detected (Max Depth 1). Iterates N times performing constant work per step, resulting in linear O(n) time complexity."
      : `Nested loop structure detected (Max Depth ${maxLoopDepth}). Inner loops execute relative to outer loops, resulting in quadratic/polynomial O(n^${maxLoopDepth}) time complexity.`);

  return (
    <section className="complexity-card">
      <div className="complexity-head" onClick={() => setIsExpanded((v) => !v)}>
        <div className="title">
          <Cpu size={16} className="title-icon" />
          <span>TIME & SPACE COMPLEXITY</span>
        </div>
        <div className="badge-row">
          <span className="complexity-badge time-avg" title="Average Time Complexity">
            Time: {timeComp.average}
          </span>
          <span className="complexity-badge space-val" title="Auxiliary Space Complexity">
            Space: {timeComp.space}
          </span>
          <button className="expand-btn" aria-label="Toggle explanation">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="complexity-body">
          <div className="complexity-grid">
            <div className="metric-box">
              <label>BEST CASE TIME</label>
              <strong>{timeComp.best}</strong>
            </div>
            <div className="metric-box highlight">
              <label>AVERAGE TIME</label>
              <strong>{timeComp.average}</strong>
            </div>
            <div className="metric-box">
              <label>WORST CASE TIME</label>
              <strong>{timeComp.worst}</strong>
            </div>
            <div className="metric-box space">
              <label>SPACE COMPLEXITY</label>
              <strong>{timeComp.space}</strong>
            </div>
          </div>

          <div className="complexity-explanation">
            <div className="expl-head">
              <Info size={14} /> <span>Why is it {timeComp.average}?</span>
            </div>
            <p>{explanation}</p>
          </div>

          <div className="complexity-footer">
            <span>
              <HardDrive size={13} /> Runtime AST Operations: <strong>{stepsCount} steps</strong>
            </span>
            <span>
              Max Loop Depth: <strong>{maxLoopDepth}</strong>
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
