import { describe, expect, it } from "vitest";
import { interpret } from "./interpreter";
import { examples } from "../examples/forLoopExamples";

const getExample = (query: string) => {
  const found = examples.find((e) => e.name.toLowerCase().includes(query.toLowerCase()));
  if (!found) throw new Error(`Example for query "${query}" not found`);
  return found;
};

describe("AST interpreter", () => {
  it("produces correct output and a final false condition", () => {
    const ex = getExample("Simple For Loop");
    const result = interpret(ex.code);
    expect(result.error).toBeUndefined();
    expect(result.steps.at(-1)?.type).toBe("loop-complete");
    expect(result.steps.at(-1)?.output).toEqual(["i = 0", "i = 1", "i = 2", "i = 3", "i = 4"]);
    expect(result.steps.filter((step) => step.type === "condition-check").at(-1)?.result).toBe(false);
  });

  it("tracks assignments", () => {
    const ex = getExample("Fibonacci");
    const result = interpret(ex.code);
    expect(result.error).toBeUndefined();
    expect(result.steps.at(-1)?.variables.b).toBe(13);
    expect(result.steps.at(-1)?.output).toEqual(["7th Fibonacci number: 13"]);
  });

  it("tracks array access", () => {
    const ex = getExample("Bubble Sort");
    const result = interpret(ex.code);
    expect(result.error).toBeUndefined();
    expect(result.steps.some((step) => step.activeArray?.name === "arr")).toBe(true);
  });

  it("supports nested loops", () => {
    const ex = getExample("Nested Loops Grid");
    const result = interpret(ex.code);
    expect(result.error).toBeUndefined();
    expect(result.steps.at(-1)?.output).toHaveLength(6);
    expect(Math.max(...result.steps.map((step) => step.loopDepth))).toBe(2);
  });

  it("supports Merge Sorted Array with FunctionExpression, reverse for-loop, and break", () => {
    const ex = getExample("Merge Sorted");
    const result = interpret(ex.code);
    expect(result.error).toBeUndefined();
    expect(result.steps.at(-1)?.output).toEqual(["Merged: [1, 2, 2, 3, 5, 6]"]);
    expect(result.steps.some((step) => step.type === "loop-break")).toBe(true);
  });

  it("supports Reverse String algorithm with Math.floor and in-place swap", () => {
    const ex = getExample("Reverse String");
    const result = interpret(ex.code);
    expect(result.error).toBeUndefined();
    expect(result.steps.at(-1)?.output).toEqual(["Reversed: [o, l, l, e, H]"]);
  });

  it("supports Binary Search algorithm", () => {
    const ex = getExample("Binary Search");
    const result = interpret(ex.code);
    expect(result.error).toBeUndefined();
    expect(result.steps.at(-1)?.output).toEqual(["Target found at index: 5"]);
  });

  it("supports Move Zeroes two pointer algorithm", () => {
    const ex = getExample("Move Zeroes");
    const result = interpret(ex.code);
    expect(result.error).toBeUndefined();
    expect(result.steps.at(-1)?.output).toEqual(["Result: [1, 3, 12, 0, 0]"]);
  });

  it("reports syntax and unsupported constructs safely", () => {
    const invalidResult = interpret("for (let i = 0; i < 5 i++) {}");
    expect(invalidResult.error).toBeDefined();
    expect(invalidResult.error?.kind).toBe("syntax");

    const unsupportedResult = interpret("class Foo {}");
    expect(unsupportedResult.error).toBeDefined();
    expect(unsupportedResult.error?.kind).toBe("unsupported");
  });
});
