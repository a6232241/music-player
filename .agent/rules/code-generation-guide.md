---
trigger: always_on
---

* The main method in app/(tabs)/index.tsx is the entry point to showcase functionality.
* Do not generate code in the main method. Instead generate distinct functionality in a new file (eg. Feature.tsx or feature.ts)
* Then, generate example code to show the new functionality in a new method in app/(tabs)/index.tsx (eg. example_feature_x) and simply call that method from the main method.
* **Important Constraint**: Whenever you write or modify a file ending in `.tsx`, `.jsx`, `.ts`, or `.js`, you MUST check if it contains a `require()` or `import` call pointing directly to the `assets/` folder. If so, you must execute the rule described in `../skills/resolve-assets-require/SKILL.md]` and ask the user for permission to resolve it via `assets/index.ts`.