---
name: Enforce Services Directory Structure
description: This skill enforces the project's services directory structure for networking, persistence, and external SDKs. It is called by the `dir-struct-router` skill when unstaged and non-deleted files exist in `services/` or when related loose utility files are discovered.
version: 0.1.0
---

# Enforce Services Directory Structure

This skill ensures that all code responsible for external communication, data persistence, and data transformation adheres to the `services/` directory structure rules before changes are staged for commit. It must **only** inspect unstaged and non-deleted files.

## Directory Structure Rules

1. **Core Responsibility**: The `services/` directory is responsible for all external communication, data persistence, and data transformation mapping.
2. If related files exist in the unstaged area (but are outside of `services/`), they should be proposed to be moved into `services/` at the project root. If the `services/` directory does not exist, it should be created.
3. **Structure Tree**: The following structure must be adhered to for complex logic:
```
services/
├── api/                     # 網路請求
│   ├── client.ts            #   - Axios/Fetch 實體與攔截器 (Token 注入、錯誤攔截)
│   └── endpoints/           #   - 按業務模塊定義請求 (auth.ts, shop.ts)
├── adapters/                # 【資料清洗】API DTO 與 Domain Model 的轉換橋樑
│   ├── userAdapter.ts       #   - 範例：將 user_id 轉為 id，處理預設頭像
│   └── productAdapter.ts    
├── storage.ts               # Async Storage 操作封裝 (getItem, setItem, clear)
├── database/
│   ├── client.ts            # 資料庫初始化 (SQLite.openDatabase)
│   ├── maintenance.ts       # 專門處理非業務邏輯，包含 checkpoint, verify, backup, vacuum
│   ├── schema.ts            # 資料表定義 (CREATE TABLE 語句)
│   ├── migrations/          # 存放資料庫升級腳本 (v1.ts, v2.ts)
│   └── repositories/        # 業務邏輯查詢層 (按對象分類)
│       ├── UserRepository.ts#   - 例如：getUser(), saveUser()
│       └── PostRepository.ts
└── third-party/             # 第三方 SDK 配置
    ├── firebase.ts          #   - Firebase 初始化與封裝
    └── analytics.ts         #   - 追蹤埋點邏輯
└── system/                  # OS 級別服務
    ├── fileService.ts       #   - 封裝 FileSystem 操作
    └── deviceService.ts     #   - 獲取設備資訊、權限檢查
```
4. **Flattening Constraint**: If a sub-directory's logic does not exceed 200 lines, it may be flattened into a single file at the root of `services/` (e.g., `services/api.ts` or `services/database.ts`).
5. **No Empty Creation**: If the unstaged area does not contain related files, do **not** preemptively create these empty subdirectories or files.

## Execution Workflow

1. Identify the new or modified files within the `services/` directory, or related files that belong in services (such as API definitions or database logic), from the unstaged changes.
2. Evaluate these files against the structural rules above.
3. Check line counts of any flattened files (`api.ts`, `database.ts`, etc.) to ensure they haven't exceeded 200 lines. If they have, propose splitting them into the full tree structure defined in Rule 3.
4. **You must construct a planning table (規劃表)** summarizing the proposed file moves, creations, or splits.
5. Present the planning table to the user. Do **not** apply changes immediately. Let the user know the proposed changes and wait for explicit approval.
6. If the user agrees, execute the splits and file moves.
7. If the user disagrees or does not want to apply the changes, end the conversation cleanly.

**Crucial Note**: All conversations, proposed changes, planning tables (規劃表), explanations, and responses to the user MUST be in Traditional Chinese (繁體中文).
