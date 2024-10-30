#!/usr/bin/env node
import path from "path";
import {
  extractScriptsFromPackage,
  runScript,
  runCustomCommand,
  scanFoldersForPackages,
  promptProjectSelection,
  promptScriptSelection,
} from "./functions";
import {
  loadConfig,
  promptFoldersToScan,
  saveConfig,
  clearConfig,
  promptPackageManager,
} from "./config";

const args = process.argv.slice(2);
const shouldClearConfig = args.includes("--clear");

const startCliTool = async () => {
  try {
    if (shouldClearConfig) {
      clearConfig();
      return;
    }

    let config = loadConfig();

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
            const projectPathParts = path
              .dirname(selectedProject)
              .split(/\\|\//);
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
  } catch (error) {
    console.error(error);
  }
};

startCliTool();
