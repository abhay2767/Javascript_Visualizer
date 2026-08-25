import { describe, expect, it } from "vitest";
import { interpret } from "./interpreter";
import { examples } from "../examples/forLoopExamples";

describe("AST interpreter", () => {
  it("produces correct output and a final false condition", () => {
    const result = interpret(examples[0].code);
    expect(result.error).toBeUndefined();
    expect(result.steps.at(-1)?.type).toBe("loop-complete");
    expect(result.steps.at(-1)?.output).toEqual(["0", "1", "2", "3", "4"]);
    expect(result.steps.filter(step => step.type === "condition-check").at(-1)?.result).toBe(false);
  });

  it("tracks assignments", () => {
    const result = interpret(examples[1].code);
    expect(result.error).toBeUndefined();
    expect(result.steps.at(-1)?.variables.sum).toBe(15);
    expect(result.steps.at(-1)?.output).toEqual(["15"]);
  });

  it("tracks array access", () => {
    const result = interpret(examples[2].code);
    expect(result.error).toBeUndefined();
    expect(result.steps.filter(step => step.type === "console-output").map(step => step.activeArray?.index)).toEqual([0, 1, 2, 3]);
  });

  it("supports nested loops", () => {
    const result = interpret(examples[3].code);
    expect(result.error).toBeUndefined();
    expect(result.steps.at(-1)?.output).toHaveLength(6);
    expect(Math.max(...result.steps.map(step => step.loopDepth))).toBe(2);
  });

  it("supports Merge Sorted Array with FunctionExpression, reverse for-loop, and break", () => {
    const result = interpret(examples[4].code);
    expect(result.error).toBeUndefined();
    expect(result.steps.at(-1)?.output).toEqual(["MergeSort:- [1, 2, 2, 3, 5, 6]"]);
    expect(result.steps.some(step => step.type === "loop-break")).toBe(true);
  });

  it("supports while loops and break statements", () => {
    const result = interpret(examples[5].code);
    expect(result.error).toBeUndefined();
    expect(result.steps.some(step => step.type === "loop-break")).toBe(true);
    expect(result.steps.at(-1)?.output).toEqual(["Count: 5", "Count: 4", "Count: 3", "Breaking at 2"]);
  });

  it("supports for-of loops", () => {
    const result = interpret(examples[6].code);
    expect(result.error).toBeUndefined();
    expect(result.steps.at(-1)?.output).toEqual(["Apple", "Banana", "Cherry"]);
  });

  it("supports Reverse String algorithm with Math.floor and in-place swap", () => {
    const result = interpret(examples[7].code);
    expect(result.error).toBeUndefined();
    expect(result.steps.at(-1)?.output).toEqual(["String:- [o, l, l, e, H]"]);
  });

  it("reports syntax and unsupported constructs safely", () => {
    expect(interpret("for (let i = 0; i < 3; i++ { }").error?.kind).toBe("syntax");
    expect(interpret("try {} catch(e) {}").error?.kind).toBe("unsupported");
  });
});
