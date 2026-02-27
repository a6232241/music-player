---
name: Conventional Commits
description: This skill should be used when the user asks to "create commit", "commit message", "git commit", or when formatting commit messages.
version: 0.1.0
---

# Conventional Commits Guidelines

This skill provides guidelines for creating Conventional Commits messages.

## Core Rules

1.  **Format**:
    *   Use the format: `<type>(<scope>): <subject>`
    *   Types:
        *   `feat`: New feature
        *   `fix`: Bug fix
        *   `docs`: Documentation only
        *   `style`: Formatting, no code change
        *   `refactor`: Code change that neither fixes a bug nor adds a feature
        *   `perf`: Performance improvement
        *   `test`: Adding or updating tests
        *   `chore`: Maintenance tasks

2.  **Scope**:
    *   Keep subjects under 50 chars.
    *   Use platform prefixes in scope if applicable: `fix(android): ...` or `feat(ios): ...`.

3.  **Language**:
    *   Responses and commit messages must be in **Traditional Chinese (Taiwan)**.

4.  **User Input Priority**:
    *   If the user provides specific text or a description in their request (e.g., `create commit "TEST: just TEST"`), this user-provided text **MUST** appear at the very beginning of the commit message, verbatim.
    *   The AI-generated Conventional Commit message should follow on a new line.
    *   **Example**:
        *   User Input: `create commit "TEST: just TEST"`
        *   Result:
            ```
            TEST: just TEST
            feat(scope): ai generated commit message...
            ```

5.  **Staged Changes Only**:
    *   **CRITICAL**: Only generate commit messages based on **staged changes** (detected via `git diff --cached`).
    *   **IGNORE** any unstaged changes in the working directory when generating the message.
    *   **NEVER** automatically stage unstaged files unless explicitly requested by the user.
    *   **NEVER** commit unstaged files.

## Workflow

1.  Run `git diff --cached` to analyze **staged** changes.
2.  Determine the type and scope.
3.  Draft the message in Traditional Chinese.
4.  Ensure it follows the `<type>(<scope>): <subject>` format.
5.  Let me check before send commit message.
