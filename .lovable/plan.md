## Goal

Start from a clean slate: reduce the project to just a `README.md` describing the live quiz app, so the next iterations can build it up intentionally.

## What I'll do

1. **Remove the scaffold**
   - Delete all source files: `src/`, `vite.config.ts`, `tsconfig.json`, `components.json`, `eslint.config.js`, `.prettierrc`, `.prettierignore`, `bunfig.toml`, `package.json`, `bun.lock`, `.lovable/project.json`.
   - Result: an empty workspace except for `.gitignore`.

2. **Create `README.md`**
   - Project title: "Live Quiz"
   - One-paragraph description: a multiplayer live quiz app where a host runs a game and players join from their own devices to answer in real time, with a dynamic admin for creating and managing quizzes.
   - Empty sections for `Tech Stack`, `Features`, `Getting Started` — to be filled in as we build.

## Heads-up

Lovable's preview requires a runnable app (TanStack Start scaffold, `package.json`, etc.). Once we strip it down to just a README, **the live preview will go blank / fail to build** until we re-introduce a framework in a follow-up step. That's expected for a "blank repo" starting point — just confirming you want that before I proceed.

## Next steps (after this plan)

When you're ready to start building, I'll re-scaffold the chosen stack (recommend keeping TanStack Start + Lovable Cloud for realtime/database/auth, which fits a host+players multiplayer quiz well) and we'll go feature by feature: quiz CRUD → host game flow → player join + realtime answers → scoring.
