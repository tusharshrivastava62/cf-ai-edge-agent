export function toolList(): string {
  return [
    "time_now: returns current UTC time",
    "basic_math: evaluates a simple arithmetic expression"
  ].join("\n");
}

export function runTool(name: string, input: string): string {
  if (name === "time_now") return new Date().toISOString();
  if (name === "basic_math") {
    if (!/^[0-9+\-*/().\s]+$/.test(input)) return "Invalid math expression.";
    // eslint-disable-next-line no-new-func
    const v = Function(`"use strict"; return (${input});`)();
    return String(v);
  }
  return "Unknown tool.";
}
