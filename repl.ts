import readline from "readline";
import Funxion from "./index";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// rl.setPrompt("fxn> ");

let vars = new Map<string, any>();

const fns = {
  define: (variable, value) => (vars.set(variable, value), true),
  delete: (variable) => (vars.delete(variable), true),
  exit: () => (process.exit(), true),
};

rl.on("line", (input) => {
  const parserResult = Funxion.parse(input);

  const r = Funxion.exec(parserResult, Object.fromEntries(vars), fns);

  console.log(r);
});
