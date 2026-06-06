import "dotenv/config";
import { spawn } from "node:child_process";

const LOOP_DELAY_MS = Number(process.env.ARBITRUM_QUOTER_LOOP_DELAY_MS ?? 100);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function runSingleIteration(): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("npm", ["run", "execute:deployed:arbitrum:cross-pool:ethers"], {
      stdio: "inherit",
      env: process.env,
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`Iteration process exited with code ${String(code)}`));
    });
  });
}

async function main() {
  if (!Number.isFinite(LOOP_DELAY_MS) || LOOP_DELAY_MS < 0) {
    throw new Error(`Invalid loop delay: ${String(LOOP_DELAY_MS)}`);
  }

  console.log(`Starting cross-pool loop. Delay=${LOOP_DELAY_MS}ms`);

  // Endless poller with a fixed delay from script settings.
  let keepRunning = true;
  while (keepRunning) {
    try {
      await runSingleIteration();
    } catch (e) {
      console.error("Loop iteration failed:", e);
    }

    await sleep(LOOP_DELAY_MS);
    keepRunning = true;
  }
}

main().catch((e) => {
  console.error("Cross-pool loop script failed:", e);
  process.exitCode = 1;
});




