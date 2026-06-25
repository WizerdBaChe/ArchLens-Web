# ArchLens Web

Turn a project's folder structure into a clean, shareable text summary. Point it
at a folder (or drop a `.zip`) and it produces an ASCII directory tree you can
paste into a README, a ticket, or an AI prompt. Everything runs **in the
browser** — nothing is uploaded.

This is the `understand` stage of the [ArchLens suite](../AGENTS.md): it is the
**producer** of the shared `tree` artifact that the sister tools (Diff,
Dependency, DocsGap) consume.

```
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check (tsc -b) + production build → dist/
npm run preview    # serve the production build locally
npm run lint       # eslint
```

## What it does

- **Scan a folder** via the File System Access API (Chrome / Edge), or **upload
  a `.zip`** (parsed in-browser with JSZip) — drag-and-drop is supported on the
  empty state.
- Render the structure two ways: an interactive node tree (toggle files in/out)
  and a live ASCII preview that updates as you toggle.
- **Smart truncation** and a `basic` / `full` mode keep large trees readable.
- Export the result as **`.txt`**, **`.md`**, or the suite's **`tree` JSON
  envelope**, or hand it straight off to ArchLens Diff for comparison.

## How it's structured

```
src/
  types.ts                 ← shared TreeNodeData / InputSource contracts
  services/                ← pure browser logic, no React
    scanner.ts              · folder + zip scanning into a node tree
    ignoreRules.ts          · .gitignore-style exclusion
    formatter.ts            · node tree → ASCII string
    treeExport.ts           · node tree → suite `tree` envelope JSON
    archlensSchema.ts       · the versioned envelope contract
    handoff.ts              · send a tree to ArchLens Diff (anti-silo handoff)
  hooks/
    useProjectTree.ts       ← the seam between services and React: owns all
                              state (root node, ASCII result, mode, loading…)
  components/
    TreeNode.tsx            · interactive, toggleable node tree
    TreeView.tsx            · ASCII preview + export / copy / handoff menu
  BlueprintTheme.tsx        ← the single UI shell (see "Theming" below)
  App.tsx                   ← runs useProjectTree(), renders BlueprintTheme
```

The scanning/formatting/export logic in `services/` has no React dependency, so
the data path (folder → node tree → ASCII / envelope) is testable and reusable
independently of the UI.

## Data contract

ArchLens Web is the **source** of the suite's `tree` atom. Exports are wrapped in
the shared versioned envelope so any sister product can consume them directly:

```json
{ "archlens": "1.0", "kind": "tree", "payload": { "nodes": [{ "path": "src/app.ts", "type": "file" }] } }
```

See the suite-level [`AGENTS.md`](../AGENTS.md) (Layer B) for the envelope spec.

## Theming

The UI uses the suite's shared design tokens (`@archlens/tokens`, vendored at
`src/styles/archlens-tokens.css`) and ships a single **Blueprint** look —
`<html>` statically mounts `al-theme-blueprint`, so `BlueprintTheme.tsx` reads
the shared `--al-*` color roles rather than hardcoding a palette. The earlier
Light / Hacker themes and the runtime theme toggle were retired when the suite
converged on Blueprint (they live in this repo's `_archive/`, out of the build).

## Privacy

100% client-side. Folder contents and uploaded zips are read and processed in
your browser; nothing is sent to a server.
