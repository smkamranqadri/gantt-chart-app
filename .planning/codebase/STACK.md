# Codebase Stack Map

## Product Runtime Stack

- Language: TypeScript (strict mode, no emit in app tsconfig)
- UI framework: React 19
- Renderer: React DOM 19
- Runtime model: client-side SPA in browser

## Build And Dev Tooling

- Bundler/dev server: Vite 7 (`vite`, `vite build`, `vite preview`)
- Type checking/build gate: `tsc -b` before Vite production build
- Package manager/lockfile: npm with `package-lock.json`

## Styling Stack

- Utility CSS: Tailwind CSS 4
- PostCSS plugins:
  - `@tailwindcss/postcss`
  - `autoprefixer`
- Custom global styles/animation: `src/index.css`

## Linting, Formatting, And Hygiene

- Linting: ESLint 9 flat config (`eslint.config.js`)
- TS lint presets: `typescript-eslint` recommended rules
- React linting: `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- Formatting: Prettier 3
- Git hooks bootstrap: Husky (`prepare` script)
- Dependency audit script: `npm audit --audit-level=high`

## Build/Runtime Configuration Files

- Vite config: `vite.config.ts`
- TypeScript configs:
  - `tsconfig.json`
  - `tsconfig.app.json`
  - `tsconfig.node.json`
- CSS pipeline configs:
  - `tailwind.config.cjs`
  - `postcss.config.cjs`
- Lint config: `eslint.config.js`

## Deployment Stack

- Container base image: `nginx:alpine`
- Static server: Nginx (`nginx.conf`) with SPA fallback and cache/security headers
- Deployment target: CapRover (via `deploy.sh` + `captain-definition`)
- Deploy-time environment variables (`.env`):
  - `CAPROVER_HOST`
  - `CAPROVER_PASSWORD`
  - `CAPROVER_APP_NAME`
  - `CAPROVER_BRANCH` (optional)

## NPM Script Surface

- `npm run dev`: launch Vite dev server
- `npm run build`: `tsc -b` + Vite production build
- `npm run preview`: serve production build locally
- `npm run lint` / `npm run lint:fix`: static analysis
- `npm run format` / `npm run format:check`: formatting
- `npm run security`: high-severity dependency audit

## Gaps And Observations

- No automated test runner is configured (no Vitest/Jest/Playwright scripts).
- Tailwind v4 + classic config files coexist; current setup works, but style pipeline conventions should remain consistent if upgraded.
- Deployment script assumes CapRover CLI is available in PATH.
