---
name: Enforce Components Directory Structure
description: This skill enforces the project's global components directory structure. It is called by the `dir-struct-router` skill when unstaged files exist in the `components/` directory.
version: 0.1.0
---

# Enforce Components Directory Structure

This skill ensures that all UI code adheres to the project's global `components/` directory structure rules before changes are staged for commit. It must **only** inspect unstaged files.

## Directory Structure Rules

1. The `components/` directory must **only** contain React components and their corresponding `index.ts` files.
2. If the total number of components in the root of `components/` is **10 or less**, they can remain as flat files.
3. If the total number of components exceeds **10**, you **must** propose organizing them into the following tree structure:

```
components/
├── ui/                      # 【可拆分】最基礎的零件 (純 UI，不帶業務邏輯)
│   ├── Button.tsx           #   - 簡單組件：直接以具名檔案平鋪
│   └── Card/                #   - 複雜組件：使用資料夾收納
│       ├── Card.tsx         #     - 主檔案具名，禁止使用 index.tsx 寫邏輯
│       ├── CardHeader.tsx   #     - 內部子組件
│       └── index.ts         #     - 桶文件 (Barrel File)，僅負責 re-export
└── layout/                  # 佈局相關組件
    ├── Container.tsx        #   - 頁面水平間距控制
    └── SafeAreaWrapper.tsx  #   - 針對不同機型的安全區域封裝
```

4. For complex components (e.g., `Card`), they must use a folder containing sub-components, a main `<ComponentName>.tsx` file, and an `index.ts` barrel file that only handles re-exporting. **Do not put component logic directly inside `index.tsx`.**

## Execution Workflow

1. Identify the new or modified files within the `components/` directory from the unstaged changes.
2. Determine the total number of files in the `components/` directory. If the scale exceeds 10 components, ensure they are correctly grouped into `ui/` or `layout/`.
3. Evaluate if any unstaged files violate the rules (e.g., putting non-components in `components/`, using `index.tsx` for logic, or flat files exceeding the threshold).
4. **You must construct a planning table (規劃表)** summarizing the proposed file moves and creations. Explain the modification process clearly.
5. Present the planning table to the user. Do **not** apply changes immediately. Let the user know the proposed changes and wait for explicit approval.
6. If the user agrees, execute the splits and file moves.
7. If the user disagrees or does not want to apply the changes, end the conversation cleanly.

**Crucial Note**: All conversations, proposed changes, planning tables (規劃表), explanations, and responses to the user MUST be in Traditional Chinese (繁體中文).
