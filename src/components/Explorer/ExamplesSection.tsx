"use client";

import { Sparkles, BookOpen } from "lucide-react";
import { examples } from "@/examples/forLoopExamples";

export function ExamplesSection({
  activeExampleIndex,
  onSelectExample,
}: {
  activeExampleIndex: number | null;
  onSelectExample: (index: number) => void;
}) {
  return (
    <div className="explorer-section">
      <div className="section-title">
        <Sparkles size={13} /> EXAMPLES
      </div>
      <div className="section-list">
        {examples.map((ex, index) => {
          const fileName = `${ex.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.js`;
          const isActive = activeExampleIndex === index;
          return (
            <button
              key={ex.name}
              className={`example-item ${isActive ? "active" : ""}`}
              onClick={() => onSelectExample(index)}
              title={ex.description}
            >
              <BookOpen size={14} className="example-icon" />
              <span className="file-name">{fileName}</span>
              <span className="read-only-badge">template</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
