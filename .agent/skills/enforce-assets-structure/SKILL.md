---
name: Enforce Assets Directory Structure
description: This skill enforces the project's assets directory structure and naming conventions. It is called by the `dir-struct-router` skill when unstaged files exist in the `assets/` directory.
version: 0.1.0
---

# Enforce Assets Directory Structure

This skill ensures that all assets adhere to the project's `assets/` directory structure and naming conventions before changes are staged for commit. It is executed automatically by the **Directory Structure Router** skill when there are unstaged files related to assets.

## Directory Structure Rules

1. All static assets must reside within `assets/`.
2. The `assets/` directory has a specific taxonomy:
   - `assets/brand/`: Company Logo, Splash screens.
   - `assets/icons/`: All icons (including third-party and UI design icons).
   - `assets/images/`: General illustrations, background images.
   - `assets/fonts/`: Fonts.
3. No flat asset files should exist at the root of `assets/`. They must be categorized into one of the four subdirectories above.

## Export & Import Rules

1. **`assets/index.ts`**: This file acts as the unified export point to solve path confusion and source recognition issues.
2. Whenever a new asset is added, it **must** be exposed via `assets/index.ts`.
3. The structure of `assets/index.ts` organizes assets by `ICONS`, `IMAGES`, and `BRAND`.

## Naming Convention Guidelines

While renaming files is the responsibility of the developer, you should **suggest** (but not forcefully modify) the following naming convention for assets:

**Format:** `[Category]_[Source]_[Subject]_[Style]_[State]_[Color]` (SVG can ignore Style or Color)

* **Category:** What is it? `ic_` (icon), `img_` (image), `bg_` (background), `il_` (illustration)
* **Source:** Where is it from? `ds_` (designer), `[lib-name]_` (known library), `lib_` (unknown library)
* **Subject:** What is its name in English? (e.g., `user_avatar`)
* **Style:** Solid or Outline? `fill` / `outline`
* **State:** Is it active? `active` / `disable` / `dark`

*Example:* `ic_ds_user_avatar_fill_active.png`

**Note:**
- Do not use version numbers `_v1`, `_v2` unless keeping a legacy copy for comparison.
- Fonts should be named as `[FamilyName]-[Weight][Italic].(ttf|otf)` (e.g., `Roboto-Bold.ttf`, `Inter-MediumItalic.otf`).

## Execution Workflow

When called by the Directory Structure Router skill, follow these exact steps:

1. Identify the new or modified files within the `assets/` directory from the unstaged changes.
2. Check if the files are correctly placed within `brand/`, `icons/`, `images/`, or `fonts/`. If a file is flat in `assets/`, propose moving it.
3. Check `assets/index.ts`. If the new asset is not exported in this index, propose adding an export for it under `ICONS`, `IMAGES`, or `BRAND`.
5. Warn the user gently if the filenames blatantly violate the naming convention guidelines, but clarify that renaming is optional.
6. Present the proposed changes (file moves and `index.ts` modifications) to the user. **You must construct a planning table (規劃表) summarizing these changes.** Do **not** apply them immediately.
7. If the user agrees, use the appropriate tools to move files and edit `index.ts`.
8. If the user disagrees or does not want to apply the changes, end the conversation cleanly.

**Crucial Note**: All conversations, proposed changes, planning tables (規劃表), explanations, and responses to the user MUST be in Traditional Chinese (繁體中文).
