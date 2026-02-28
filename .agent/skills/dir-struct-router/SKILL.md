---
name: Directory Structure Router
description: This skill should be used when the user mentions "dir struct" or asks to route uncommitted files. It reads the local unstaged files and routes matching file paths to the appropriate directory structure enforcement skills.
version: 0.1.0
---

# Directory Structure Router

This skill acts as an intelligent router for enforcing directory structure rules. When the user says "dir struct", it analyzes the current unstaged changes and decides which specific validation skills to invoke.

## Execution Workflow

1. Use the `run_command` tool to run `git status -s` (or `git status -u`) to identify all unstaged, modified, or added files in the repository.
2. Group the modified files by their root directories.
3. Compare the changed files against known routing rules below.
4. If a matched rule exists, read the corresponding SKILL file using the `view_file` tool and proceed with its validation workflow.
5. If multiple rules match, execute them sequentially.
6. If no unstaged files are found, or if none of them match the routing rules, inform the user that all structural checks passed.

**Crucial Note**: All conversations, explanations, and responses to the user MUST be in Traditional Chinese (繁體中文).

## Routing Rules

### 1. Screens Structure
- **Condition**: If any of the unstaged files fall under the `screens/` directory, or if they are in `app/` and appear to contain newly injected UI logic that belongs in `screens/`.
- **Target Skill**: Read and execute `../enforce-screens-structure/SKILL.md`.

### 2. Assets Structure
- **Condition**: If any of the unstaged files fall under the `assets/` directory.
- **Target Skill**: Read and execute `../enforce-assets-structure/SKILL.md`.

*More routing rules can be added here in the future as the project grows (e.g., hooks, api, components).*
