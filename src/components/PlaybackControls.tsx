import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";

export function PlaybackControls({ current, total, playing, speed, onCurrent, onPlaying, onSpeed, onRestart }: { current: number; total: number; playing: boolean; speed: number; onCurrent: (n: number) => void; onPlaying: (v: boolean) => void; onSpeed: (n: number) => void; onRestart: () => void }) {
  return <div className="playback">
    <div className="play-left"><button className="control ghost" onClick={onRestart} disabled={!total}><RotateCcw size={16} /> Restart</button><button className="control icon" onClick={() => onCurrent(Math.max(0, current - 1))} disabled={!total || current === 0} aria-label="Previous step"><SkipBack size={18} /></button><button className="control primary round" onClick={() => onPlaying(!playing)} disabled={!total}>{playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}</button><button className="control icon" onClick={() => onCurrent(Math.min(total - 1, current + 1))} disabled={!total || current >= total - 1} aria-label="Next step"><SkipForward size={18} /></button></div>
    <span className="step-counter">{total ? `${current + 1} / ${total}` : "No steps"}</span>
    <label className="speed">Speed <select value={speed} onChange={e => onSpeed(Number(e.target.value))}>{[0.5, 1, 1.5, 2].map(value => <option key={value} value={value}>{value}x</option>)}</select></label>
  </div>;
}
