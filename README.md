# Praxis

Praxis is an interactive AI programming tutor: you chat with an AI to receive incremental coding challenges, write code in an embedded editor, run the code against automated tests, and get adaptive feedback and the next challenge, all inside the browser.

## Table of contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Development](#development)
- [Build for Production](#build-for-production)
- [Project Structure](#project-structure)
- [Usage Examples](#usage-examples)
- [Contribution Guidelines](#contribution-guidelines)
- [License](#license)
- [Contact](#contact)

## Features

- Vite-powered fast dev server and build pipeline
- React with TypeScript for type-safe UI development
- Minimal, modular component layout under `src/components`
- Example static assets available in `public/`
- Opinionated structure suitable for learning or bootstrapping an app

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js 18 or later (recommended LTS)
- npm (comes with Node) or yarn/pnpm if you prefer an alternative package manager

Verify your Node.js and npm versions:

```bash
node --version
npm --version
```

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/praxis.git
cd praxis
```

2. Install dependencies:

```bash
npm install
# or
# yarn
# pnpm install
```

3. Start the development server:

```bash
npm run dev
```

Open http://localhost:5173 (or the port reported by Vite) in your browser.

## Development

- Run the lint/typecheck (if configured):

```bash
npm run type-check
npm run lint
```

- Run unit tests (if present):

```bash
npm test
```

Make changes in `src/` and the dev server will hot-reload. For UI work, edit components in `src/components/`:

- `ChatPanel.tsx` — sample chat UI
- `CodeEditorPanel.tsx` — placeholder for a code editor
- `TestOutputPanel.tsx` — results/output panel

## Build for Production

To build an optimized production bundle:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Project Structure

Top-level files and folders you'll regularly interact with:

- `index.html` — Vite entry HTML
- `src/` — application source code
  - `App.tsx` — root app shell
  - `index.tsx` — app bootstrap
  - `components/` — reusable UI components
  - `types.ts` — TypeScript types used across the app
- `public/` — static assets served as-is
- `package.json` — scripts and dependencies
- `tsconfig.json` — TypeScript configuration
- `vite.config.ts` — Vite configuration

## Usage Examples

Run the dev server and navigate to the app. Example: if you want to add a new component and use it in the app:

1. Create `src/components/MyWidget.tsx`:

```tsx
import React from 'react';

export default function MyWidget() {
  return <div className="my-widget">Hello from MyWidget</div>;
}
```

2. Import and render `MyWidget` in `src/App.tsx`:

```tsx
import MyWidget from './components/MyWidget';

function App() {
  return (
    <div>
      <MyWidget />
    </div>
  );
}

export default App;
```

## Contribution Guidelines

Contributions are welcome. To make the collaboration smooth, please follow these guidelines:

1. Fork the repository and create a topic branch for your changes:

2. Write clear, focused commits. Use conventional commit messages when possible.

3. Run tests and linters locally before opening a pull request.

4. Open a pull request describing the change, why it's needed, and any notes for reviewers.

Coding standards and tips:

- Use TypeScript types and interfaces for new modules.
- Keep components small and focused; prefer composition over monolithic components.
- Add or update unit tests for any non-trivial logic.

## License

This project is provided under the MIT License. See the `LICENSE` file for details.

Key points:

- Permission is granted to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software.
- The software is provided "as is", without warranty of any kind.

If you want a different license for your project (e.g., Apache 2.0, GPLv3), update this section and include the proper license file.

## Contact

For questions, issues, or collaboration inquiries, please contact:

- Your Name — spaudel@vassar.edu
- GitHub: https://github.com/smpdl

If you'd like to contribute or report a bug, please open an issue on the repository.

---

Thank you for checking out `Praxis`!
