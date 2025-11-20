# Migration from Vite to Next.js

This project has been successfully migrated from Vite + React to Next.js 15.

## Key Changes

### 1. Project Structure
- **Old**: `index.html`, `index.tsx`, `App.tsx`, `vite.config.ts`
- **New**: `app/` directory with `layout.tsx` and page files

### 2. Routing
- **Old**: Client-side state-based routing (`useState` for page navigation)
- **New**: Next.js App Router with file-based routing
  - `/` → `app/page.tsx` (Home)
  - `/bridge` → `app/bridge/page.tsx`
  - `/upload` → `app/upload/page.tsx`
  - `/receive` → `app/receive/page.tsx`

### 3. Navigation
- **Old**: Custom `onNavigate` callback prop
- **New**: Next.js `Link` component and `useRouter` hook
- Updated `Navbar` component to use Next.js navigation

### 4. API Routes
- **Old**: Direct client-side API calls to Gemini (`services/geminiService.ts`)
- **New**: Next.js API route at `app/api/chat/route.ts`
- Updated `ChatWidget` to call `/api/chat` endpoint

### 5. Styling
- **Old**: Tailwind via CDN in `index.html`
- **New**: Tailwind configured via `tailwind.config.js` and `postcss.config.js`
- Global styles moved to `app/globals.css`

### 6. Environment Variables
- **Old**: Vite's `process.env` with `define` in `vite.config.ts`
- **New**: Next.js environment variables (`.env.local` for local development)
- Create `.env.local` with `GEMINI_API_KEY=your_key_here`

### 7. Components
- All components using hooks or framer-motion now have `'use client'` directive
- Components remain in `components/` directory

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
npm start
```

## Removed Files
- `index.html`
- `index.tsx`
- `App.tsx`
- `vite.config.ts`
- `services/geminiService.ts` (moved to API route)

## Notes
- The project now uses Next.js 15 with the App Router
- All client components are properly marked with `'use client'`
- API routes are server-side only
- Static assets (images, SVGs) can remain in the root or be moved to `public/` directory

