import { select } from "@inquirer/prompts";

export const promptProjectSelection = async (folders: string[]) => {
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
