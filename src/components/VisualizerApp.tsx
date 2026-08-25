"use client";

import { useMemo, useState } from "react";
import { Code2, Moon, Play, Sparkles, Sun, TriangleAlert } from "lucide-react";
import { CodeEditor } from "./CodeEditor";
import { PlaybackControls } from "./PlaybackControls";
import { ArrayPanel, ConsolePanel, StepCard, VariablePanel } from "./VisualPanels";
import { Timeline } from "./Timeline";
import { examples } from "@/examples/forLoopExamples";
import { interpret } from "@/engine/interpreter";
import { usePlayback } from "@/hooks/usePlayback";

export function VisualizerApp() {
  const [code, setCode] = useState(examples[0].code);
  const [example, setExample] = useState(0);
  const [result, setResult] = useState(() => interpret(examples[0].code));
  const [dark, setDark] = useState(true);
  const playback = usePlayback(result.steps.length);
  const step = result.steps[playback.current];
  const visualize = () => { const next = interpret(code); setResult(next); playback.restart(); };
  const selectExample = (index: number) => { setExample(index); setCode(examples[index].code); setResult(interpret(examples[index].code)); playback.restart(); };
  const progress = result.steps.length ? ((playback.current + 1) / result.steps.length) * 100 : 0;
  const stats = useMemo(() => ({ loops: result.steps.filter(item => item.type === "loop-complete").length, outputs: step?.output.length ?? 0 }), [result.steps, step]);

  return <main className={dark ? "app dark" : "app light"}>
    <header className="topbar"><a className="brand" href="#"><span><Code2 size={21} /></span><div>JavaScript <strong>Visualizer</strong></div><em>BETA</em></a><div className="header-actions"><button className="theme-toggle" onClick={() => setDark(value => !value)} aria-label="Toggle theme">{dark ? <Sun size={17} /> : <Moon size={17} />}</button><button className="visualize" onClick={visualize}><Play size={16} fill="currentColor" /> Visualize</button></div></header>
    <section className="intro"><div><span className="intro-kicker"><Sparkles size={13} /> STEP THROUGH THE RUNTIME</span><h1>See what your code is <em>thinking.</em></h1><p>Watch variables change, conditions resolve, and loops unfold—one instruction at a time.</p></div><div className="examples"><label>TRY AN EXAMPLE</label><div>{examples.map((item, index) => <button className={example === index ? "active" : ""} key={item.name} onClick={() => selectExample(index)}><span>0{index + 1}</span>{item.name}</button>)}</div></div></section>
    <section className="workspace">
      <CodeEditor value={code} onChange={setCode} activeLine={step?.line} onReset={() => selectExample(example)} />
      <div className="visual-side">
        <div className="visual-head"><div><span className="eyebrow">VISUALIZATION</span><h2>Runtime explorer</h2></div><div className="runtime-stats"><span><b>{stats.loops}</b> loops</span><span><b>{stats.outputs}</b> outputs</span></div></div>
        {result.error ? <div className="error-panel"><TriangleAlert size={26} /><div><span>{result.error.kind === "syntax" ? "JavaScript Error" : "Unsupported syntax"}</span><h2>{result.error.message}</h2>{result.error.line && <p>Line {result.error.line}, column {result.error.column}</p>}<small>Please fix the code and try again.</small></div></div> : step ? <><StepCard step={step} /><div className="panel-grid"><VariablePanel step={step} /><ArrayPanel step={step} /></div><ConsolePanel output={step.output} /></> : <div className="empty-state"><Code2 size={32} /><h2>Ready to explore</h2><p>Edit the code, then press Visualize.</p></div>}
      </div>
    </section>
    {!result.error && <><Timeline steps={result.steps} current={playback.current} onSelect={playback.setCurrent} /><div className="progress"><span style={{ width: `${progress}%` }} /></div><PlaybackControls current={playback.current} total={result.steps.length} playing={playback.playing} speed={playback.speed} onCurrent={playback.setCurrent} onPlaying={playback.setPlaying} onSpeed={playback.setSpeed} onRestart={playback.restart} /></>}
  </main>;
}
