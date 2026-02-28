---
name: Enforce Screens Directory Structure
description: This skill enforces the screens directory structure. It is meant to be called by the `dir-struct-router` skill when unstaged files exist in the `screens` directory. It checks unstaged files to ensure that any new or modified screen components adhere to the project's folder scale rule.
version: 0.1.0
---

# Enforce Screens Directory Structure

This skill ensures that all UI code adheres to the project's `screens/` directory structure rules before changes are staged for commit. It is executed automatically by the **Directory Structure Router** skill when there are unstaged files related to the UI.

## Directory Structure Rules

1. All application roots (e.g., in `app/`) should only import and render components from the `screens/` directory. No UI logic should exist directly in the `app/` routes.
2. If a screen's scale is large (i.e., **> 5 files** or containing complex UI logic):
   - Create a dedicated folder: `screens/<ScreenName>/`
   - Subject specific related files to inner directories like `components/`, `hooks/`, `contexts/`, `types/`, `constants/`, `hocs/`, `api/`, `styles/`.
   - The main entry point should be `<ScreenName>Screen.tsx` along with an `index.ts` exporting it.
3. If a screen's scale is small (i.e., **< 5 files** and simple logic):
   - Create a flat file directly in the `screens/` directory: `screens/<ScreenName>Screen.tsx`
   - Keep the flat file approach to maintain development speed.

## Execution Workflow

When called by the Directory Structure Router skill, follow these exact steps:

1. Use the `run_command` tool to run `git status -u` to identify all unstaged or modified files.
2. Analyze the modified or added files related to screens (`app/`, `screens/`, `components/` targeted for single screens).
3. Evaluate if any screen is violating the scale rules (e.g., flat files in `screens/` getting too large, or complex logic left in `app/`).
4. Propose necessary file moves or creations to the user based on the rules. Do **not** apply them immediately. Let the user know the proposed changes and wait for approval.
5. If the user agrees, use the appropriate tools to move/refactor the files. 
6. If the user disagrees or does not want to apply the changes, end the conversation cleanly and do not force modifications.

## Helper Scripts

To accurately determine the number of files related to a specific screen, use the `list_dir` tool to count files inside directories such as `screens/<ScreenName>`. 

### Examples of Proposed Changes
- "It looks like `screens/ProfileScreen.tsx` has grown to include 6 files in total with helper types and components nearby. I recommend moving this into a `screens/Profile/` directory with a `components/` sub-folder."
- "You have UI logic directly in `app/settings.tsx`. I recommend extracting this to `screens/SettingsScreen.tsx`."
