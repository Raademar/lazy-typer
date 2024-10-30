import { select } from "@inquirer/prompts";

export const promptScriptSelection = async (scripts: {
  [key: string]: string;
}) => {
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
