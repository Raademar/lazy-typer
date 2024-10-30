import fs from "fs";

export const extractScriptsFromPackage = (
  packageFile: string
): Record<string, string> => {
  const pkg = JSON.parse(fs.readFileSync(packageFile, "utf-8"));
  return pkg.scripts || {};
};
