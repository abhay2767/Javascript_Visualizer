import { parse } from "acorn";
import type { ExecutionStep, VisualValue, VisualizerError } from "@/types/execution";

type Node = any;
type Env = Record<string, VisualValue>;

class VisualizerException extends Error {
  constructor(message: string, public node?: Node, public kind: VisualizerError["kind"] = "unsupported") { super(message); }
}

class BreakSignal {}
class ContinueSignal {}

const copy = (value: VisualValue): VisualValue => Array.isArray(value) ? value.map(copy) : value;
const printable = (value: VisualValue): string => value === undefined ? "undefined" : Array.isArray(value) ? `[${value.map(printable).join(", ")}]` : String(value);

export function interpret(source: string): { steps: ExecutionStep[]; error?: VisualizerError } {
  let ast: Node;
  try {
    ast = parse(source, { ecmaVersion: "latest", sourceType: "script", locations: true });
  } catch (error) {
    const e = error as Error & { loc?: { line: number; column: number } };
    return { steps: [], error: { kind: "syntax", message: e.message.replace(/ \(\d+:\d+\)$/, ""), line: e.loc?.line, column: e.loc ? e.loc.column + 1 : undefined } };
  }

  const env: Env = {};
  const functions: Record<string, Node> = {};
  const output: string[] = [];
  const steps: ExecutionStep[] = [];
  let operations = 0;
  let activeArray: ExecutionStep["activeArray"];

  const location = (node: Node) => ({ line: node.loc?.start.line ?? 1, column: (node.loc?.start.column ?? 0) + 1 });
  const snapshot = () => Object.fromEntries(Object.entries(env).filter(([, v]) => typeof v !== "function" && !(v && typeof v === "object" && "__isFunction" in (v as object))).map(([key, value]) => [key, copy(value)]));
  const arrays = () => Object.fromEntries(Object.entries(env).filter(([, value]) => Array.isArray(value)).map(([key, value]) => [key, copy(value) as VisualValue[]]));
  const add = (node: Node, depth: number, data: Omit<ExecutionStep, "id" | "line" | "column" | "variables" | "arrays" | "output" | "loopDepth">) => {
    if (++operations > 2000) throw new VisualizerException("Execution exceeded 2,000 steps. Check for an infinite loop.", node, "runtime");
    steps.push({ id: steps.length + 1, ...location(node), variables: snapshot(), arrays: arrays(), output: [...output], loopDepth: depth, ...data });
  };

  const evaluate = (node: Node): VisualValue => {
    activeArray = undefined;
    switch (node.type) {
      case "Literal": return node.value as VisualValue;
      case "Identifier": {
        if (node.name === "undefined") return undefined;
        if (node.name in env) return env[node.name];
        if (node.name in functions) return { __isFunction: true, node: functions[node.name] } as unknown as VisualValue;
        return undefined;
      }
      case "ArrayExpression": return node.elements.map((item: Node) => evaluate(item));
      case "FunctionExpression":
      case "ArrowFunctionExpression": {
        return { __isFunction: true, node } as unknown as VisualValue;
      }
      case "BinaryExpression": {
        const left = evaluate(node.left);
        const right = evaluate(node.right);
        switch (node.operator) {
          case "+": return (left as any) + (right as any);
          case "-": return (left as number) - (right as number);
          case "*": return (left as number) * (right as number);
          case "/": return (left as number) / (right as number);
          case "%": return (left as number) % (right as number);
          case "<": return (left as number) < (right as number);
          case ">": return (left as number) > (right as number);
          case "<=": return (left as number) <= (right as number);
          case ">=": return (left as number) >= (right as number);
          case "===": return left === right;
          case "!==": return left !== right;
          case "==": return left === right;
          case "!=": return left !== right;
          default: throw new VisualizerException(`Operator ${node.operator} is not supported yet.`, node);
        }
      }
      case "LogicalExpression": {
        if (node.operator === "&&") {
          const left = evaluate(node.left);
          if (!left) return left;
          return evaluate(node.right);
        }
        if (node.operator === "||") {
          const left = evaluate(node.left);
          if (left) return left;
          return evaluate(node.right);
        }
        throw new VisualizerException(`Logical operator ${node.operator} is not supported yet.`, node);
      }
      case "UnaryExpression": {
        const value = evaluate(node.argument);
        if (node.operator === "!") return !value;
        if (node.operator === "-") return -(value as number);
        if (node.operator === "+") return +(value as number);
        throw new VisualizerException(`Unary operator ${node.operator} is not supported yet.`, node);
      }
      case "MemberExpression": {
        if (node.object.type === "Identifier" && node.object.name === "Math") {
          const prop = node.computed ? String(evaluate(node.property)) : node.property.name;
          return (Math as any)[prop];
        }
        if (node.object.type !== "Identifier") throw new VisualizerException("Only direct variable property access is supported.", node);
        const name = node.object.name;
        const target = env[name];
        if (node.computed) {
          const index = Number(evaluate(node.property));
          activeArray = { name, index };
          if (Array.isArray(target)) return target[index];
          if (typeof target === "string") return target[index];
          return undefined;
        }
        const propName = node.property.name;
        if (propName === "length") {
          if (Array.isArray(target)) return target.length;
          if (typeof target === "string") return target.length;
        }
        if (target && typeof target === "object" && propName in (target as object)) {
          return (target as any)[propName];
        }
        throw new VisualizerException(`Property '${propName}' access on ${name} is not supported.`, node);
      }
      case "CallExpression": {
        // 1. MemberExpression calls (e.g. Math.floor, Math.abs, arr.slice, arr.push, str.split)
        if (node.callee.type === "MemberExpression") {
          const objName = node.callee.object.type === "Identifier" ? node.callee.object.name : "";
          const propName = node.callee.computed ? String(evaluate(node.callee.property)) : node.callee.property.name;
          const args = node.arguments.map((arg: Node) => evaluate(arg));

          if (objName === "Math" && typeof (Math as any)[propName] === "function") {
            return (Math as any)[propName](...args);
          }

          const targetObj = objName ? env[objName] : evaluate(node.callee.object);
          if (Array.isArray(targetObj) && typeof (Array.prototype as any)[propName] === "function") {
            const ret = (targetObj as any)[propName](...args);
            if (objName) {
              activeArray = { name: objName, index: targetObj.length - 1 };
            }
            return ret;
          }

          if (typeof targetObj === "string" && typeof (String.prototype as any)[propName] === "function") {
            return (targetObj as any)[propName](...args);
          }

          if (targetObj && typeof (targetObj as any)[propName] === "function") {
            return (targetObj as any)[propName](...args);
          }
        }

        // 2. Identifier calls (e.g. parseInt, Number, String, custom functions)
        if (node.callee.type === "Identifier") {
          const name = node.callee.name;
          if (name === "parseInt") return parseInt(String(evaluate(node.arguments[0])), Number(node.arguments[1] ? evaluate(node.arguments[1]) : 10));
          if (name === "parseFloat") return parseFloat(String(evaluate(node.arguments[0])));
          if (name === "Number") return Number(evaluate(node.arguments[0]));
          if (name === "String") return String(evaluate(node.arguments[0]));
          if (name === "Boolean") return Boolean(evaluate(node.arguments[0]));
          if (name === "isNaN") return isNaN(Number(evaluate(node.arguments[0])));

          let funcNode: Node = null;
          if (functions[name]) {
            funcNode = functions[name];
          } else if (env[name] && typeof env[name] === "object" && "__isFunction" in (env[name] as object)) {
            funcNode = (env[name] as any).node;
          }

          if (funcNode) {
            return callCustomFunction(node, name, funcNode, 0);
          }
        }

        throw new VisualizerException(`Function call ${node.callee.name || node.callee.property?.name || "expression"} is not supported yet.`, node);
      }
      default: throw new VisualizerException(`${node.type} expressions are not supported yet.`, node);
    }
  };

  const callCustomFunction = (node: Node, name: string, funcNode: Node, depth: number): VisualValue => {
    const args = node.arguments.map((arg: Node) => {
      if (arg.type === "Identifier" && env[arg.name] !== undefined) {
        return env[arg.name];
      }
      return evaluate(arg);
    });

    add(node, depth, {
      type: "function-call",
      title: `Call ${name || "function"}()`,
      description: `Execute ${name || "anonymous function"} with arguments (${args.map(printable).join(", ")}).`
    });

    const params = funcNode.params || [];
    params.forEach((param: Node, i: number) => {
      if (param.type === "Identifier") {
        env[param.name] = args[i];
      }
    });

    try {
      if (funcNode.body.type === "BlockStatement") {
        executeStatement(funcNode.body, depth + 1);
      } else {
        const retVal = evaluate(funcNode.body);
        return retVal;
      }
    } catch (e) {
      if (e instanceof VisualizerException) throw e;
      if (e && typeof e === "object" && "returnVal" in e) {
        return (e as any).returnVal;
      }
    }
    return undefined;
  };

  const declare = (node: Node, depth: number) => {
    for (const declaration of node.declarations) {
      if (declaration.id.type !== "Identifier") throw new VisualizerException("Destructuring is not supported yet.", declaration);
      const varName = declaration.id.name;
      const value = declaration.init ? evaluate(declaration.init) : undefined;
      env[varName] = value;
      if (value && typeof value === "object" && "__isFunction" in (value as object)) {
        functions[varName] = (value as any).node;
        add(declaration, depth, {
          type: "function-declaration",
          title: `Define ${varName}()`,
          description: `Function ${varName} is created.`
        });
      } else {
        add(declaration, depth, {
          type: "variable-declaration",
          title: `Create ${varName}`,
          description: `Initialize ${varName} with ${printable(value)}.`,
          change: { name: varName, from: undefined, to: copy(value) }
        });
      }
    }
  };

  const assign = (node: Node, depth: number) => {
    if (node.left.type === "MemberExpression") {
      if (node.left.object.type !== "Identifier") throw new VisualizerException("Only array element assignment is supported.", node);
      const name = node.left.object.name;
      const targetArray = env[name];
      if (!Array.isArray(targetArray)) throw new VisualizerException(`${name} is not an array.`, node);
      const index = Number(evaluate(node.left.property));
      const from = targetArray[index];
      const right = evaluate(node.right);
      let to: VisualValue;
      if (node.operator === "=") {
        to = right;
      } else if (node.operator === "+=") {
        to = (from as number) + (right as number);
      } else if (node.operator === "-=") {
        to = (from as number) - (right as number);
      } else {
        throw new VisualizerException(`Assignment operator ${node.operator} is not supported yet.`, node);
      }
      targetArray[index] = to;
      activeArray = { name, index };
      add(node, depth, {
        type: "assignment",
        title: `Set ${name}[${index}] = ${printable(to)}`,
        description: `Update ${name}[${index}] from ${printable(from)} to ${printable(to)}.`,
        change: { name: `${name}[${index}]`, from: copy(from), to: copy(to) },
        activeArray
      });
      return;
    }

    if (node.left.type !== "Identifier") throw new VisualizerException("Only variable or array element assignment supported.", node);
    const name = node.left.name;
    const from = env[name];
    const right = evaluate(node.right);
    let to: VisualValue;
    if (node.operator === "=") {
      to = right;
    } else if (node.operator === "+=") {
      to = (from as number) + (right as number);
    } else if (node.operator === "-=") {
      to = (from as number) - (right as number);
    } else {
      throw new VisualizerException(`Assignment operator ${node.operator} is not supported yet.`, node);
    }

    if (to && typeof to === "object" && "__isFunction" in (to as object)) {
      functions[name] = (to as any).node;
      env[name] = to;
      add(node, depth, {
        type: "function-declaration",
        title: `Assign function to ${name}`,
        description: `Assign function expression to ${name}.`
      });
    } else {
      env[name] = to;
      add(node, depth, {
        type: "assignment",
        title: `Update ${name}`,
        description: `${name} changes from ${printable(from)} to ${printable(to)}.`,
        change: { name, from: copy(from), to: copy(to) },
        activeArray
      });
    }
  };

  const update = (node: Node, depth: number) => {
    if (node.argument.type !== "Identifier") throw new VisualizerException("Only variable increments are supported.", node);
    const name = node.argument.name;
    const from = env[name];
    const to = Number(from) + (node.operator === "++" ? 1 : -1);
    env[name] = to;
    add(node, depth, { type: "increment", title: `${node.operator === "++" ? "Increment" : "Decrement"} ${name}`, description: `${name}: ${printable(from)} → ${to}.`, change: { name, from, to } });
  };

  const executeIf = (node: Node, depth: number) => {
    const result = Boolean(evaluate(node.test));
    const testSource = source.slice(node.test.start, node.test.end);
    add(node.test, depth, {
      type: "condition-check",
      title: `Check if condition`,
      description: result ? `Condition '${testSource}' evaluated to true.` : `Condition '${testSource}' evaluated to false.`,
      evaluation: testSource,
      result,
      activeArray
    });

    if (result) {
      executeStatement(node.consequent, depth);
    } else if (node.alternate) {
      executeStatement(node.alternate, depth);
    }
  };

  const executeStatement = (node: Node, depth: number): void => {
    switch (node.type) {
      case "VariableDeclaration": declare(node, depth); return;
      case "FunctionDeclaration": {
        functions[node.id.name] = node;
        env[node.id.name] = { __isFunction: true, node } as unknown as VisualValue;
        add(node, depth, {
          type: "function-declaration",
          title: `Define ${node.id.name}()`,
          description: `Define function ${node.id.name} with parameters (${node.params.map((p: any) => p.name).join(", ")}).`
        });
        return;
      }
      case "BlockStatement": node.body.forEach((item: Node) => executeStatement(item, depth)); return;
      case "ForStatement": executeFor(node, depth); return;
      case "WhileStatement": executeWhile(node, depth); return;
      case "DoWhileStatement": executeDoWhile(node, depth); return;
      case "ForOfStatement": executeForOf(node, depth); return;
      case "ForInStatement": executeForIn(node, depth); return;
      case "IfStatement": executeIf(node, depth); return;
      case "BreakStatement": {
        add(node, depth, {
          type: "loop-break",
          title: "Break loop",
          description: "Break statement executed. Exiting the loop."
        });
        throw new BreakSignal();
      }
      case "ContinueStatement": {
        add(node, depth, {
          type: "loop-continue",
          title: "Continue loop",
          description: "Continue statement executed. Skipping to next iteration."
        });
        throw new ContinueSignal();
      }
      case "ReturnStatement": {
        const val = node.argument ? evaluate(node.argument) : undefined;
        add(node, depth, {
          type: "return",
          title: "Return statement",
          description: `Return ${printable(val)}.`
        });
        throw { returnVal: val };
      }
      case "EmptyStatement": return;
      case "ExpressionStatement": {
        const expression = node.expression;
        if (expression.type === "AssignmentExpression") { assign(expression, depth); return; }
        if (expression.type === "UpdateExpression") { update(expression, depth); return; }
        if (expression.type === "CallExpression") {
          if (expression.callee.type === "MemberExpression" && expression.callee.object.name === "console" && expression.callee.property.name === "log") {
            const values = expression.arguments.map((arg: Node) => evaluate(arg));
            const line = values.map(printable).join(" ");
            output.push(line);
            add(node, depth, { type: "console-output", title: "Write to console", description: `console.log prints ${line}.`, activeArray });
            return;
          }
          evaluate(expression);
          return;
        }
        throw new VisualizerException("Only assignments, updates, function calls, and console.log calls are supported as statements.", node);
      }
      default: throw new VisualizerException(`${node.type} statements are not supported yet.`, node);
    }
  };

  const executeFor = (node: Node, depth: number) => {
    if (node.init) {
      if (node.init.type === "VariableDeclaration") {
        declare(node.init, depth);
      } else if (node.init.type === "AssignmentExpression") {
        assign(node.init, depth);
      } else {
        throw new VisualizerException("Unsupported for-loop initializer.", node.init);
      }
    }
    let iteration = 0;
    while (true) {
      const result = node.test ? Boolean(evaluate(node.test)) : true;
      const testSource = node.test ? source.slice(node.test.start, node.test.end) : "true";
      add(node.test ?? node, depth, { type: "condition-check", title: `Check loop condition`, description: result ? `The condition is true, so iteration ${iteration + 1} begins.` : "The condition is false, so the loop stops.", evaluation: testSource, result, activeArray });
      if (!result) break;
      add(node.body, depth, { type: "loop-body", title: `Iteration ${iteration + 1}`, description: `Enter the loop body at depth ${depth + 1}.` });
      
      try {
        executeStatement(node.body, depth + 1);
      } catch (e) {
        if (e instanceof BreakSignal) break;
        if (e instanceof ContinueSignal) {
          // continue to update
        } else throw e;
      }

      if (node.update) {
        if (node.update.type === "UpdateExpression") {
          update(node.update, depth);
        } else if (node.update.type === "AssignmentExpression") {
          assign(node.update, depth);
        } else {
          throw new VisualizerException("Unsupported for-loop update.", node.update);
        }
      }
      iteration++;
    }
    add(node, depth, { type: "loop-complete", title: "Loop complete", description: `The loop finished after ${iteration} iteration${iteration === 1 ? "" : "s"}.` });
  };

  const executeWhile = (node: Node, depth: number) => {
    let iteration = 0;
    while (true) {
      const result = Boolean(evaluate(node.test));
      const testSource = source.slice(node.test.start, node.test.end);
      add(node.test, depth, {
        type: "condition-check",
        title: `Check while condition`,
        description: result ? `Condition '${testSource}' evaluated to true, iteration ${iteration + 1} begins.` : `Condition '${testSource}' evaluated to false, while loop ends.`,
        evaluation: testSource,
        result,
        activeArray
      });
      if (!result) break;
      add(node.body, depth, { type: "loop-body", title: `Iteration ${iteration + 1}`, description: `Execute while loop body at depth ${depth + 1}.` });
      
      try {
        executeStatement(node.body, depth + 1);
      } catch (e) {
        if (e instanceof BreakSignal) break;
        if (e instanceof ContinueSignal) {
          iteration++;
          continue;
        }
        else throw e;
      }
      iteration++;
    }
    add(node, depth, { type: "loop-complete", title: "While loop complete", description: `While loop finished after ${iteration} iteration${iteration === 1 ? "" : "s"}.` });
  };

  const executeDoWhile = (node: Node, depth: number) => {
    let iteration = 0;
    while (true) {
      add(node.body, depth, { type: "loop-body", title: `Do-While Iteration ${iteration + 1}`, description: `Execute do-while body.` });
      
      try {
        executeStatement(node.body, depth + 1);
      } catch (e) {
        if (e instanceof BreakSignal) break;
        if (e instanceof ContinueSignal) {
          // continue to test check
        }
        else throw e;
      }

      const result = Boolean(evaluate(node.test));
      const testSource = source.slice(node.test.start, node.test.end);
      add(node.test, depth, {
        type: "condition-check",
        title: `Check do-while condition`,
        description: result ? `Condition '${testSource}' evaluated to true, continuing loop.` : `Condition '${testSource}' evaluated to false, do-while loop ends.`,
        evaluation: testSource,
        result,
        activeArray
      });
      if (!result) break;
      iteration++;
    }
    add(node, depth, { type: "loop-complete", title: "Do-While complete", description: `Do-While loop finished after ${iteration} iteration${iteration === 1 ? "" : "s"}.` });
  };

  const executeForOf = (node: Node, depth: number) => {
    const rightVal = evaluate(node.right);
    if (!Array.isArray(rightVal)) throw new VisualizerException("for..of requires an array.", node.right);
    const varName = node.left.type === "VariableDeclaration" ? node.left.declarations[0].id.name : node.left.name;
    for (let i = 0; i < rightVal.length; i++) {
      const item = rightVal[i];
      env[varName] = item;
      activeArray = node.right.type === "Identifier" ? { name: node.right.name, index: i } : undefined;
      add(node.left, depth, {
        type: "variable-declaration",
        title: `Pick ${varName} = ${printable(item)}`,
        description: `For-of iteration ${i + 1}: ${varName} = ${printable(item)}.`,
        change: { name: varName, from: undefined, to: copy(item) },
        activeArray
      });
      try {
        executeStatement(node.body, depth + 1);
      } catch (e) {
        if (e instanceof BreakSignal) break;
        if (e instanceof ContinueSignal) continue;
        else throw e;
      }
    }
    add(node, depth, { type: "loop-complete", title: "For-of complete", description: "For-of loop completed." });
  };

  const executeForIn = (node: Node, depth: number) => {
    const rightVal = evaluate(node.right);
    const keys = Object.keys(rightVal || {});
    const varName = node.left.type === "VariableDeclaration" ? node.left.declarations[0].id.name : node.left.name;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      env[varName] = key;
      add(node.left, depth, {
        type: "variable-declaration",
        title: `Pick key ${varName} = "${key}"`,
        description: `For-in iteration ${i + 1}: ${varName} = "${key}".`,
        change: { name: varName, from: undefined, to: copy(key) }
      });
      try {
        executeStatement(node.body, depth + 1);
      } catch (e) {
        if (e instanceof BreakSignal) break;
        if (e instanceof ContinueSignal) continue;
        else throw e;
      }
    }
    add(node, depth, { type: "loop-complete", title: "For-in complete", description: "For-in loop completed." });
  };

  try { ast.body.forEach((node: Node) => executeStatement(node, 0)); return { steps }; }
  catch (error) {
    if (error && typeof error === "object" && "returnVal" in error) {
      return { steps };
    }
    const e = error instanceof VisualizerException ? error : new VisualizerException(error instanceof Error ? error.message : "Unknown error", undefined, "runtime");
    return { steps: [], error: { kind: e.kind, message: e.message, line: e.node?.loc?.start.line, column: e.node ? e.node.loc.start.column + 1 : undefined } };
  }
}
