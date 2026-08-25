import type { ExecutionStep } from "@/types/execution";
import { Braces, Check, ChevronRight, Terminal, X } from "lucide-react";

const show = (value: unknown) => value === undefined ? "undefined" : typeof value === "string" ? `“${value}”` : JSON.stringify(value);

export function StepCard({ step }: { step: ExecutionStep }) {
  return <section className="step-card">
    <div className="step-meta"><span className={`type-pill ${step.type}`}>{step.type.replaceAll("-", " ")}</span><span>Line {step.line}</span>{step.loopDepth > 0 && <span className="depth">Loop depth {step.loopDepth}</span>}</div>
    <h2>{step.title}</h2><p>{step.description}</p>
    {step.evaluation && <div className="evaluation"><span>Evaluation</span><code>{step.evaluation}</code><strong className={step.result ? "truthy" : "falsy"}>{step.result ? <Check size={16} /> : <X size={16} />}{String(step.result)}</strong></div>}
    {step.change && <div className="change"><span>{step.change.name}</span><code>{show(step.change.from)}</code><ChevronRight size={18} /><code className="new-value">{show(step.change.to)}</code></div>}
  </section>;
}

export function VariablePanel({ step }: { step: ExecutionStep }) {
  const entries = Object.entries(step.variables).filter(([, value]) => !Array.isArray(value));
  return <section className="mini-panel"><div className="mini-title"><Braces size={16} /> Variables <span>{entries.length}</span></div>{entries.length ? <div className="variables">{entries.map(([name, value]) => <div className={`variable ${step.change?.name === name ? "changed" : ""}`} key={name}><code>{name}</code><strong>{show(value)}</strong></div>)}</div> : <p className="empty-small">Variables appear as they are created.</p>}</section>;
}

export function ArrayPanel({ step }: { step: ExecutionStep }) {
  const entries = Object.entries(step.arrays);
  return <section className="mini-panel arrays-panel"><div className="mini-title"><span className="array-icon">[ ]</span> Arrays <span>{entries.length}</span></div>{entries.length ? entries.map(([name, values]) => <div className="array-group" key={name}><code>{name}</code><div className="array-row">{values.map((value, index) => <div className={`array-cell ${step.activeArray?.name === name && step.activeArray.index === index ? "active" : ""}`} key={index}><span>{index}</span><strong>{show(value)}</strong></div>)}</div></div>) : <p className="empty-small">Array values will be visualized here.</p>}</section>;
}

export function ConsolePanel({ output }: { output: string[] }) {
  return <section className="mini-panel console-panel"><div className="mini-title"><Terminal size={16} /> Console <span>{output.length}</span></div><div className="console-body">{output.length ? output.map((line, index) => <div key={index}><span>›</span> {line}</div>) : <p>No output yet</p>}</div></section>;
}
