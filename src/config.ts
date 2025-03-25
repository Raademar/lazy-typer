import fs from "fs";
import path from "path";
import os from "os";
import { input, select } from "@inquirer/prompts";
import { Config } from "./types";

const getConfigDirectory = () => {
  const platform = os.platform();
  let configDir;

  if (platform === "win32") {
    // On Windows, use AppData\Local
    configDir = path.join(
      process.env.APPDATA || path.join(os.homedir(), "AppData", "Local"),
      "lazy-typer"
    );
  } else if (platform === "darwin" || platform === "linux") {
    // On macOS or Linux, follow the XDG Base Directory Specification
    configDir = path.join(
      process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config"),
      "lazy-typer"
    );
  } else {
    // Fallback to the user's home directory (not ideal, but a fallback)
    configDir = path.join(os.homedir(), ".lazy-typer");
  }

  return configDir;
};

const getConfigFilePath = () => {
  const configDir = getConfigDirectory();
  const configFile = path.join(configDir, "config.json");
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  return configFile;
};

export const loadConfig = (key: string): Config | null => {
  const configFilePath = getConfigFilePath();

  if (fs.existsSync(configFilePath)) {
    const configContent = fs.readFileSync(configFilePath, "utf-8");
    const configs = JSON.parse(configContent) as Record<string, Config>;
    const config = configs[key] ?? null;
    return config;
  }
  return null;
};

const loadFullConfig = (): Record<string, Config> | null => {
  const configFilePath = getConfigFilePath();

  if (fs.existsSync(configFilePath)) {
    const configContent = fs.readFileSync(configFilePath, "utf-8");
    const configs = JSON.parse(configContent) as Record<string, Config>;
    return configs;
  }
  return null;
};

export const saveConfig = (
  key: string,
  folders: string[],
  packageManager: string,
  customCommand?: string,
  customPackageManager?: string
) => {
  const configFilePath = getConfigFilePath();
  const currentConfigs = loadFullConfig();

  const newConfig = {
    folders,
    packageManager,
    customCommand,
    customPackageManager,
  };

  let configToSave = {};

  if (currentConfigs) {
    currentConfigs[key] = newConfig;
    configToSave = currentConfigs;
  } else {
    configToSave = { [key]: newConfig };
  }

  const configDir = path.dirname(configFilePath);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  fs.writeFileSync(
    configFilePath,
    JSON.stringify(configToSave, null, 2),
    "utf-8"
  );
  console.log(`Configuration saved`);
};

export const clearConfig = (configKey?: string) => {
  const configFilePath = getConfigFilePath();

  if (configKey) {
    const currentConfig = loadFullConfig();

    if (currentConfig && configKey in currentConfig) {
      delete currentConfig[configKey];

      if (Object.keys(currentConfig).length === 0) {
        fs.unlinkSync(configFilePath);
        console.log("Configuration file was empty and has been deleted.");
      } else {
        fs.writeFileSync(
          configFilePath,
          JSON.stringify(currentConfig, null, 2),
          "utf-8"
        );
        console.log(`Configuration for ${configKey} has been removed.`);
      }
    } else {
      console.log(`No configuration found for the key: ${configKey}`);
    }
  } else {
    if (fs.existsSync(configFilePath)) {
      fs.unlinkSync(configFilePath);
      console.log("Configuration has been cleared.");
    } else {
      console.log("No configuration file found to clear.");
    }
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
