---
name: Resolve Assets Require Logic
description: This skill verifies and resolves any direct `require('../../assets/...')` or `import ... from '../../assets/...'` imports in TS/TSX/JS/JSX files to use the unified `assets/index.ts` module instead.
version: 0.1.0
---

# Resolve Assets Require Logic

This skill acts proactively whenever UI component or standard script files are modified to ensure direct imports to physical `assets/` files are correctly encapsulated and routed through the unified `assets/index.ts` exports.

## Execution Workflow

1. For any modified (and not deleted) application code file (`.tsx`, `.jsx`, `.ts`, `.js`), check for occurrences of direct asset requirements (e.g., `require('../../assets/images/something.png')` or `import img from '../../assets/images/something.png'`).
2. If direct queries are found, determine the path of the specific asset.
3. Read the `assets/index.ts` file. 
4. If the required asset exists in `index.ts` already, note its exported key (e.g., `IMAGES.Something`).
5. If the required asset does not exist, propose a patch to add it to `assets/index.ts` under the correct category (`ICONS`, `IMAGES`, or `BRAND`).
6. Suggest modifying the target UI file to `import { [Category] } from '@/assets'` (or relative equivalent) and replacing the `require` or `import` with the extracted key `[Category].[AssetKey]`.
7. Present the proposed modifications to the user. **You must construct a planning table (規劃表) summarizing these modifications.** You **must not** apply them without explicit approval.
8. If the user agrees, run the file edit tools to update `index.ts` and the UI file(s).
9. If no invalid requires are found, simply report that checks passed.

**Crucial Note**: All conversations, proposed changes, planning tables (規劃表), explanations, and responses to the user MUST be in Traditional Chinese (繁體中文).
