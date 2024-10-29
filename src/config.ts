import * as fs from "fs";
import * as path from "path";
import { input, select } from "@inquirer/prompts";
import { Config } from "./types";

// TODO:
// Add config for project manager tools (npm, yarn, pnpm, custom)
// Custom option shows free text field with explanation
// nx run @halon/{project}:{script} regex will replace project and script with real values

const configFilePath = path.join(process.cwd(), ".lazy-typer-config.json");

export const loadConfig = (): Config | null => {
  if (fs.existsSync(configFilePath)) {
    const configContent = fs.readFileSync(configFilePath, "utf-8");
    const config = JSON.parse(configContent) as Config;
    return config;
  }
  return null;
};

export const saveConfig = (
  folders: string[],
  packageManager: string,
  customCommand?: string,
  customPackageManger?: string
) => {
  const config = {
    folders,
    packageManager,
    customCommand,
    customPackageManger,
  };
  fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2), "utf-8");
};

export const clearConfig = () => {
  if (fs.existsSync(configFilePath)) {
    fs.unlinkSync(configFilePath);
    console.log("Configuration has been cleared.");
  } else {
    console.log("No configuration file found to clear.");
  }
};

const validateFolders = (folders: string[]): string[] => {
  return folders.filter((folder) => !fs.existsSync(folder));
};

export const promptFoldersToScan = async (): Promise<string[]> => {
  console.log(
    "Please specify which folders to scan (comma separated. To use current folder input a dot '.' ):"
  );
  const folderInput = await input({
    message: "Folders to scan:",
    validate: (value) => (value ? true : "Please provide at least one folder."),
  });

  const mappedFolderInput = folderInput.split(",").map((folder) => {
    if (folder.trim() === ".") {
      return process.cwd();
    }
    return `${process.cwd()}/${folder.trim()}`;
  });

  const invalidFolders = validateFolders(mappedFolderInput);
  if (invalidFolders.length > 0) {
    console.error(
      `The following folders do not exist: ${invalidFolders.join(", ")}`
    );
    process.exit(1);
  }

  return mappedFolderInput;
};

export const promptPackageManager = async (): Promise<{
  packageManager: string;
  customCommand?: string;
  customPackageManager?: string;
}> => {
  const packageManager = await select({
    message: "Select your package manager",
    choices: [
      { name: "npm", value: "npm" },
      { name: "yarn", value: "yarn" },
      { name: "pnpm", value: "pnpm" },
      { name: "custom", value: "custom" },
    ],
  });

  let customCommand = undefined;
  let customPackageManager = undefined;

  if (packageManager === "custom") {
    customPackageManager = await input({
      message: "Enter your custom package manager (e.g., nx, gulp):",
      validate: (value) =>
        value ? true : "Please provide a valid package manager.",
    });

    customCommand = await input({
      message:
        "Enter your custom command format (use {project} for the project and {script} for the script):",
      validate: (value) =>
        value ? true : "Please provide a valid command format.",
    });

    console.log(`Custom package manager: ${customPackageManager}`);
    console.log(`Custom command format: ${customCommand}`);
  }

  return { packageManager, customCommand, customPackageManager };
};
