#!/usr/bin/env node
import path from "path";
import { select } from "@inquirer/prompts";
import {
  extractScriptsFromPackage,
  runScript,
  runCustomCommand,
  scanFoldersForPackages,
} from "./utils";
import {
  loadConfig,
  promptFoldersToScan,
  saveConfig,
  clearConfig,
  promptPackageManager,
} from "./config";

const args = process.argv.slice(2);
const shouldClearConfig = args.includes("--clear");

const promptProjectSelection = async (folders: string[]) => {
  const choices = folders.map((folder) => {
    const parts = folder.split(/\\|\//);
    const name = parts[parts.length - 2];
    return {
      name: name,
      value: folder,
    };
  });
  const folder = await select({
    message: "Select a project",
    loop: false,
    choices: [{ name: "exit", value: "exit" }, ...choices],
  });
  if (folder === "exit") {
    return null;
  }
  return folder;
};

const promptScriptSelection = async (scripts: { [key: string]: string }) => {
  const scriptNames = Object.keys(scripts);
  const choices = ["go back", ...scriptNames];
  const script = await select<string>({
    message: "Select a script to run:",
    loop: false,
    choices: choices,
  });
  if (script === "go back") {
    return null;
  }

  return script;
};

const startCliTool = async () => {
  if (shouldClearConfig) {
    clearConfig();
    return;
  }

  let config = loadConfig();

  // If no config file exists or no folders found, prompt the user to specify folders
  if (!config) {
    const foldersToScan = await promptFoldersToScan();
    const { packageManager, customCommand, customPackageManager } =
      await promptPackageManager();
    config = {
      folders: foldersToScan,
      packageManager,
      customCommand,
      customPackageManager,
    };
    // Save the configuration
    saveConfig(
      foldersToScan,
      packageManager,
      customCommand,
      customPackageManager
    );
  }

  const { folders, packageManager, customCommand, customPackageManager } =
    config;

  const allPackages = folders.flatMap((folder) =>
    scanFoldersForPackages(folder)
  );

  if (!allPackages.length) {
    console.log("No package.json's found");
    process.exitCode = 1;
  } else {
    let continueSelection = true;

    while (continueSelection) {
      const selectedProject = await promptProjectSelection(allPackages);
      if (!selectedProject) {
        console.log("Exiting, no project selected.");
        return;
      }

      const scripts = extractScriptsFromPackage(selectedProject);

      if (!Object.keys(scripts).length) {
        console.log("No scripts found in this package.");
        continue;
      }

      let selectedScript: string | null = null;

      while (!selectedScript) {
        selectedScript = await promptScriptSelection(scripts);
        if (!selectedScript) {
          console.log("Going back to project selection...");
          break;
        }
      }

      if (selectedScript) {
        const cwd = process.cwd();
        if (
          packageManager === "custom" &&
          customCommand &&
          customPackageManager
        ) {
          const projectPathParts = path.dirname(selectedProject).split(/\\|\//);
          const project = projectPathParts[projectPathParts.length - 1];

          const command = `${customPackageManager} ${customCommand
            .replace("{project}", project)
            .replace("{script}", selectedScript)}`;
          runCustomCommand(command, cwd);
        } else {
          runScript(
            selectedScript,
            path.dirname(selectedProject),
            packageManager
          );
        }
        continueSelection = false;
      }
    }
  }
};

startCliTool();
