# Probable Cause - Project Summary

Welcome to the `Probable Cause` project! This document outlines the technical architecture, design decisions, and general structure of the game to help new contributors get up to speed quickly.

## Tech Stack Overview

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **State Management**: Zustand (with local storage persistence)
- **Styling**: Vanilla CSS (`index.css`) with CSS variables for theming.
- **Icons**: `lucide-react`
- **Testing**: Vitest + React Testing Library + jsdom
- **CI/CD**: GitHub Actions (GitHub Pages deployment)

## Architecture & Directory Structure

The project is structured into several key directories under `src/`:

```text
src/
├── components/     # React UI components
├── engine/         # Core game logic, state management, and type definitions
├── stories/        # Game content (scenes, interactions, dialogues)
├── App.tsx         # Main entry point and routing
└── index.css       # Global styles and design system
```

### 1. The Game Engine (`src/engine/`)

This is the brain of the game, completely decoupled from the UI layer.

*   **`types.ts`**: Defines the data models for the game. Everything is driven by a central `Story` object which contains records of `Scenes`, `Characters`, `Clues`, and `Theories`.
*   **`gameStore.ts`**: A Zustand store that acts as the global state manager. It tracks the `currentStory`, `currentSceneId`, and `collectedClues`. It uses Zustand's `persist` middleware to automatically save and load the game state from the browser's `localStorage` under the key `probable-cause-save`. It also exports utility functions like `calculatePlausibility` which determines the current strength of a theory based on collected clues.
*   **`mathEngine.ts`**: Contains pure functions for the game's core win/loss mechanics. The `evaluateCase` function takes a plausibility percentage. If it's <= 50, it's an automatic failure. If it's > 50, it uses a Bernoulli trial (simulated via `Math.random()`) to determine if the District Attorney wins the case, with the probability of winning equal to the plausibility percentage.
*   **`__tests__/`**: Contains Vitest unit tests for the math engine and the game store's pure calculation functions.

### 2. The Content Structure (`src/stories/`)

The game is designed to be highly modular. New cases can be added simply by creating a new `Story` object.

*   **`defaultStory.ts`**: Serves as "Story 1: The Missing Artifact". It acts as a reference implementation for how to construct a case.
*   **Graph Structure**:
    *   **Scenes** contain interactable objects and IDs of present **Characters**.
    *   **Interactables** and **Dialogue Options** can grant **Clue** IDs when triggered.
    *   **Characters** have dialogue trees consisting of multiple nodes. Options can be conditionally hidden if the player lacks a specific Clue.
    *   **Clues** contain an array of `plausibilityModifiers`. When a clue is collected, it adds (or subtracts) a specific percentage from various **Theories**.

### 3. The User Interface (`src/components/`)

The UI is built to be immersive, functioning as a first-person "point and click" adventure mixed with a detective's notebook.

*   **`MainMenu.tsx`**: Handles starting a new game (loading a story into the store) or resuming an existing one.
*   **`GameLayout.tsx`**: The main shell operating when a story is active. It provides a bottom navigation bar to switch between the Scene, Notebook, and the D.A.'s Office.
*   **`SceneViewer.tsx`**: Renders the current location. It uses absolute positioning (based on percentage `x`/`y` coordinates defined in the story) to place interactable hotspots ("Search" icons) and characters ("Chat" icons) spatially on the screen. It also provides travel buttons to connected scenes.
*   **`DialogueSystem.tsx`**: A modal overlay for conversations. It reads the character's current dialogue node and renders the text and available responses. Selecting an option updates the character's state to the `nextNodeId`.
*   **`CaseNotebook.tsx`**: The inventory screen. It displays two columns: collected evidence (Clues) and a dynamic tracking card for each possible Theory/Suspect, calculating and rendering their live Plausibility score via a progress bar.
*   **`DA_Office.tsx`**: The endgame screen. The player selects a theory and submits it. It calls the `mathEngine` to determine the outcome and displays the win/loss state.

## Design Aesthetic & Styling (`src/index.css`)

The app aims for a "Noir Spy-tective" aesthetic. The design system is implemented via CSS variables at the `:root` level in `index.css`:

*   **Colors**: Deep, dark backgrounds (`--bg-dark: #0f1115`) to set a moody tone, contrasted with off-white text and vibrant Amber/Gold accents (`--accent-primary: #f59e0b`).
*   **Typography**: Uses standard sans-serif (`Inter`) for readability in UI controls and a serif font (`Playfair Display`) for headers and dialogue to give a classic, literary detective feel.
*   **Animations**: Minimal but impactful CSS animations (`fadeIn`, `slideUp`) ensure transitions feel smooth without relying on heavy animation libraries.

## Testing & CI/CD

*   **Local Testing**: Run `npx vitest run` or `npm run test` to execute the vitest test suite.
*   **Continuous Integration**: The repository is configured with a GitHub Actions workflow in `.github/workflows/deploy.yml`.
*   **Deployment**: Upon pushing to the `main` branch, the workflow automatically installs dependencies, runs the Vitest suite, builds the Vite project, and deploys the static export to GitHub Pages.

## Getting Started Example

To add a new object to a room:
1. Open up the `Story` file (e.g., `defaultStory.ts`).
2. Go to `scenes -> interactables`.
3. Add a new `{ id, name, description, x: 50, y: 50, grantsClueId: 'clue-new' }`.
4. Ensure `clue-new` is defined in the `clues` dictionary and mapped to modify an existing `Theory`.
