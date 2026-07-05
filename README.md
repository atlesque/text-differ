# Text Differ

A web app that shows differences between two texts, side by side.

Built with **Nuxt 4**, **Nuxt UI**, and **jsdiff**.

## Features

- Side-by-side diff comparison with line numbers
- Real-time comparison as you type
- Manual compare mode for large texts
- Word-level diff highlighting
- Dark mode support
- Responsive layout (side-by-side on desktop, stacked on mobile)
- Swap and Clear controls

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 10+

### Install

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Lint

```bash
pnpm lint
pnpm lint:fix
```

### Build

```bash
pnpm build
```

## Tech Stack

- [Nuxt 4](https://nuxt.com/) — Vue framework
- [Nuxt UI](https://ui.nuxt.com/) — Component library
- [Tailwind CSS 4](https://tailwindcss.com/) — Utility-first CSS
- [jsdiff](https://github.com/kpdecker/jsdiff) — Text diff engine
- [ESLint](https://eslint.nuxt.com/) — Linting with stylistic rules

## License

MIT
