import { spawn } from "node:child_process";

const npmCommand = process.platform === "win32" ? "cmd.exe" : "npm";

const processes = [
  ["backend", ["run", "dev", "--workspace", "backend"]],
  ["worker", ["run", "worker", "--workspace", "backend"]],
  ["frontend", ["run", "dev", "--workspace", "frontend"]]
].map(([name, args]) => {
  const commandArgs = process.platform === "win32" ? ["/d", "/s", "/c", "npm.cmd", ...args] : args;
  const child = spawn(npmCommand, commandArgs, {
    stdio: "inherit",
    shell: false
  });

  child.on("exit", (code) => {
    if (code && code !== 0) {
      process.exitCode = code;
    }
  });

  return { name, child };
});

function shutdown() {
  for (const processInfo of processes) {
    processInfo.child.kill();
  }
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
