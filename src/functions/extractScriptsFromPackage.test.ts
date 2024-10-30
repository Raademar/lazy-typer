import fs from "fs";
import { extractScriptsFromPackage } from "./extractScriptsFromPackage";

jest.mock("fs");

describe("extractScriptsFromPackage", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return scripts from a valid package.json file", () => {
    const mockPackageJson = {
      scripts: {
        build: "tsc",
        test: "jest",
      },
    };

    (fs.readFileSync as jest.Mock).mockReturnValue(
      JSON.stringify(mockPackageJson)
    );

    const result = extractScriptsFromPackage("path/to/package.json");
    expect(result).toEqual(mockPackageJson.scripts);
  });

  it("should return an empty object if package.json has no scripts", () => {
    const mockPackageJson = {
      name: "test-package",
    };

    // Mock fs.readFileSync to return a package.json string with no scripts
    (fs.readFileSync as jest.Mock).mockReturnValue(
      JSON.stringify(mockPackageJson)
    );

    const result = extractScriptsFromPackage("path/to/package.json");
    expect(result).toEqual({});
  });

  it("should throw an error if package.json is invalid", () => {
    // Mock fs.readFileSync to return an invalid JSON string
    (fs.readFileSync as jest.Mock).mockImplementation(() => {
      throw new Error("Invalid JSON");
    });

    expect(() => {
      extractScriptsFromPackage("path/to/package.json");
    }).toThrow("Invalid JSON");
  });

  it("should throw an error if package.json does not exist", () => {
    // Mock fs.readFileSync to throw a file not found error
    (fs.readFileSync as jest.Mock).mockImplementation(() => {
      throw new Error(
        "ENOENT: no such file or directory, open 'path/to/package.json'"
      );
    });

    expect(() => {
      extractScriptsFromPackage("path/to/package.json");
    }).toThrow(
      "ENOENT: no such file or directory, open 'path/to/package.json'"
    );
  });
});
