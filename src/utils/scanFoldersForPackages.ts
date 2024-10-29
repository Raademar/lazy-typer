import fs from "fs";
import path from "path";

export const scanFoldersForPackages = (rootPath: string) => {
  const packageFiles: string[] = [];

  const traverseDirectory = (dir: string) => {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const fullPath = path.join(dir, file);
      if (
        fs.statSync(fullPath).isDirectory() &&
        file !== "node_modules" &&
        file !== "dist"
      ) {
        traverseDirectory(fullPath);
      } else if (file === "package.json") {
        packageFiles.push(fullPath);
      }
    });
  };

  traverseDirectory(rootPath);
  return packageFiles;
};
