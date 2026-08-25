export type StepType = "variable-declaration" | "condition-check" | "loop-body" | "increment" | "array-access" | "console-output" | "assignment" | "loop-complete" | "function-declaration" | "function-call" | "return" | "loop-break" | "loop-continue";

export type VisualValue = string | number | boolean | null | undefined | VisualValue[];

export interface ExecutionStep {
  id: number;
  line: number;
  column: number;
  type: StepType;
  variables: Record<string, VisualValue>;
  arrays: Record<string, VisualValue[]>;
  output: string[];
  activeArray?: { name: string; index: number };
  loopDepth: number;
  title: string;
  description: string;
  evaluation?: string;
  result?: boolean;
  change?: { name: string; from: VisualValue; to: VisualValue };
}

export interface VisualizerError { message: string; line?: number; column?: number; kind: "syntax" | "unsupported" | "runtime"; }
