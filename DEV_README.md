# ArchLens Web — Developer Guide

This is the **developer-facing** doc: how the code is laid out, the build/test
commands, and where to extend things. If you just want to *use* the tool, see
[README.md](README.md).

## Local development

```bash
npm install
npm run dev        # vite dev server, http://localhost:5173
npm run build      # tsc -b (type-check) + vite build → dist/
npm run preview    # serve the production build
npm run lint       # eslint
```

Stack: React 19 + TypeScript + Vite, Tailwind CSS v4, JSZip for in-browser zip
parsing. No backend, no server calls — everything runs client-side.

## Architecture

The hard line is **`services/` and `hooks/` never import from `components/`.**
The data path (input → node tree → ASCII / envelope) lives in plain TypeScript
under `services/`, with React only entering at the `useProjectTree` hook.

```
src/
  types.ts                shared contracts: TreeNodeData, InputSource
  services/               pure logic, no React, independently testable
    scanner.ts             folder (File System Access API) + zip (JSZip) → node tree
    ignoreRules.ts         .gitignore-style filtering applied during scan
    formatter.ts           node tree → ASCII string (basic/full mode, truncation)
    treeExport.ts          node tree → suite `tree` envelope JSON
    archlensSchema.ts      the versioned envelope contract (kind: "tree")
    handoff.ts             POST/redirect a tree to ArchLens Diff
  hooks/
    useProjectTree.ts      the ONLY seam between services and React; owns all
                           state (rootNode, asciiResult, mode, truncation, loading, error)
  components/
    TreeNode.tsx           interactive node tree (toggle files in/out)
    TreeView.tsx           ASCII preview + copy / export / handoff menu
  BlueprintTheme.tsx       the single UI shell
  App.tsx                  runs useProjectTree(), renders BlueprintTheme
  styles/archlens-tokens.css   vendored @archlens/tokens
```

## Extending it

- **A new input source** (e.g. paste a `tree`-command dump): add a reader in
  `services/scanner.ts` that produces the same `TreeNodeData` shape; nothing
  downstream needs to change.
- **A new export format**: add it next to `formatter.ts` / `treeExport.ts` and
  surface it from `TreeView.tsx`'s export menu. Keep the suite envelope shape
  (`treeExport.ts`) intact — sister products parse against it.
- **Changing the look**: the UI consumes the shared `--al-*` color roles. To
  retune colors, change the theme pack in `@archlens/tokens`, not this repo.

## Theming note (history)

The app previously swapped two whole component trees (a Light `DefaultTheme` and
a `HackerTheme`) via a runtime toggle in `ThemeContext`. The suite standardized
on a single **Blueprint** look, so the app now renders only `BlueprintTheme`
(a re-skin of the old DefaultTheme that reads `--al-*` instead of hardcoded
colors). The retired files are kept in `_archive/` (gitignored, out of the
build) rather than deleted, for reference/reuse.

## Data contract

ArchLens Web is the suite's `tree` producer. See [README.md](README.md#data-contract)
and the suite-level [`AGENTS.md`](../AGENTS.md) (Layer B) for the envelope spec.
