import type { ExecutionStep } from "@/types/execution";

export function Timeline({ steps, current, onSelect }: { steps: ExecutionStep[]; current: number; onSelect: (n: number) => void }) {
  return <section className="timeline"><div className="timeline-head"><span className="eyebrow">EXECUTION PATH</span><span>{steps.length} steps</span></div><div className="timeline-track">{steps.map((step, index) => <button key={step.id} className={`${index === current ? "active" : ""} ${index < current ? "done" : ""}`} onClick={() => onSelect(index)} title={`${step.id}. ${step.title}`}><span>{step.id}</span></button>)}</div></section>;
}
