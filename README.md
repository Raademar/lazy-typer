# Lazy-Typer

**lazy-typer** (bin command: `lz`) is a CLI tool designed to simplify the process of navigating and running scripts in a monorepo or multi-project workspace. It allows you to scan project folders, navigate to the desired project, and run `package.json` scripts with ease. Additionally, it supports custom package manager commands.

## Features

- Scan and select project folders (e.g., `apps`, `libs`) dynamically.
- Run scripts from `package.json` in any selected project.
- Supports common package managers (`npm`, `yarn`, `pnpm`).
- Customizable commands for special workflows (e.g., `nx` or other tools).
- Configurable project folder structure and package manager preferences.

## Installation

You can install `lazy-typer` globally using npm:

```bash
npm install -g lazy-typer
```

## Usage

After installation, you can run the tool using the `lz` command:

```bash
lz
```

## First-Time Configuration

When you first run `lz`, you will be asked to configure the tool:

1. **Select Folders**: Specify which folders to scan (e.g., apps, libs). Use a dot (.) to indicate the current directory.

2. **Choose Package Manager**: Select the package manager you use (npm, yarn, pnpm, or custom).

   - If you select **custom**, you will be asked to provide:
     - A custom package manager (e.g., `nx`, `gulp`).
     - A command format (e.g., `run @company/{project}:{script}`), where `{project}` and `{script}` will be dynamically replaced during script execution.

## Running Commands

Once configured, you can run `lz` to:

1. **Select a project**: Choose a project from the scanned folders.

2. **Select a script**: Choose a script to run from the package.json file.

3. **Run the script**: The tool will execute the script using your selected package manager or custom command.

## Resetting the Configuration

To clear the existing configuration, use the `--clear` flag:

```bash
lz --clear
```

This will reset the saved folder paths and package manager settings, and prompt you to configure the tool again.

```bash
lz
# Output
# 1. Select the project folder:
#    - backend
#    - frontend
# 2. Select the script to run:
#    - build
#    - start
```

## Custom Command Example

If you use `nx`, you can configure the custom command as:

```bash
Custom Package Manager: nx
Command Format: run @company/{project}:{script}
```

Then, when you run `lz`, it will dynamically replace `{project}` and `{script}` and execute commands like:

```bash
nx run @company/backend:build
```

## License

This project is licensed under the MIT License.
