import { spawn } from "child_process";

export const runScript = (
  scriptName: string,
  folder: string,
  packageManager: string
) => {
  const child = spawn(packageManager, ["run", scriptName], {
    cwd: folder,
    stdio: "inherit",
  });

  child.on("close", (code) => {
    if (code === 0) {
      console.log(`Successfully ran ${scriptName}`);
    } else {
      console.error(`Failed with exit code ${code}`);
    }
  });
};

export const runCustomCommand = (command: string, folder: string) => {
  const [executable, ...args] = command.split(" ");

  const child = spawn(executable, args, {
    cwd: folder,
    stdio: "inherit",
  });

  child.on("close", (code) => {
    if (code === 0) {
      console.log(`Successfully ran ${command}`);
    } else {
      console.error(`Failed with exit code ${code}`);
    }
  });
};
