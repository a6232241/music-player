---
name: File Length Enforcer
description: This skill acts as the entry point when the user types "dir struct". It checks all unstaged and non-deleted files for size limit violations (>200 lines) and proposes splits. After resolving line constraints, it triggers the directory structure router to handle remaining asset/screen validations.
version: 0.1.0
---

# File Length Enforcer

This skill enforces strict file length limitations (<200 lines) for UI code, contexts, hooks, and HOCs. It must be triggered when the user types "dir struct".

## Rules

### Rule A (`.tsx`, `.jsx`)
If a `.tsx` or `.jsx` file exceeds 200 lines:
1. Provide a recommendation to split the file into smaller pieces (e.g., extracting hooks, sub-components, methods, or HOCs).
2. Priority should be given to splitting the largest blocks of code first.
3. The newly extracted files should be placed in the current directory.
4. After completing a round of splitting, run the check on the file again. Repeat this process until the files conform to the 200-line requirement.

### Rule B (`.ts`, `.js` used as Context, Hook, or HOC)
If a `.ts` or `.js` file acting as a hook, HOC, or context exceeds 200 lines:
1. Propose splitting the hook, HOC, or context.
2. If splitting Context, follow **Rule C**.
3. If splitting Hooks or HOCs, extract the largest chunks into smaller helper hooks/HOCs in the current directory.
4. After completing a round of splitting, run the check again. Repeat this process until all files conform to the 200-line requirement.

### Rule C (Context Splitting Structure)
When splitting a context, the resulting architecture must strictly follow this directory structure tree (using `Theme` as a placeholder context name):
```
Theme/                       # Directory named after the feature
├── ThemeContext.tsx         # 【定義】Create the Context object and its Type
├── ThemeProvider.tsx        # 【實作】Handle the Provider state and lifecycle
├── useTheme.ts              # 【Hook】Encapsulate useContext(ThemeContext) for external calls
└── index.ts                 # 統一匯出點 (Unified export point)
```

### Rule D (Multiple Package Implementations)
If a function contains implementations from multiple packages or libraries (e.g., mixing `expo-file-system` and `expo-sqlite` logic):
1. Separate the logic based on its package or domain responsibility.
2. Create new files in the current directory to store these newly extracted functions.
3. After splitting, you MUST execute `../enforce-services-structure/SKILL.md` to ensure the newly created files are placed in the correct hierarchy within `services/`.

## Execution Workflow

1. Use the `run_command` tool to run `git status -s` to identify all unstaged or modified (but not deleted) files.
2. For each modified application code file (ending in `.tsx`, `.jsx`, `.ts`, `.js`), check its line count.
3. If any file violates Rule A or Rule B (>200 lines), notify the user of the violation.
4. Evaluate the file and propose specific splitting plans (identifying which hooks, components, or contexts to extract). **You must construct a planning table (規劃表) summarizing the proposed extractions/splits.** Discuss this with the user.
5. You **must not** apply the changes without explicit user approval.
6. Upon the user's agreement, execute the split.
7. Re-evaluate the line counts until all modified files are strictly under 200 lines.
8. **CRITICAL COMPLETION STEP**: When all line-count and organizational rules (Rule A, Rule B, Rule C, Rule D) are fully satisfied and completed, this skill MUST transfer execution to the Directory Structure Router. Use the target skill file: `../dir-struct-router/SKILL.md` to trigger the remaining structural categorizations.

**Crucial Note**: All conversations, proposed changes, planning tables (規劃表), explanations, and responses to the user MUST be in Traditional Chinese (繁體中文).
