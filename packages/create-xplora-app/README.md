# Create Xplora App 🚀

CLI tool untuk membuat aplikasi XploraJS statis baru dengan cepat.

## 🚀 Penggunaan

```bash
# Menggunakan bun
bun create xplora-app my-app

# Menggunakan npm
npx create-xplora-app my-app

# Menggunakan yarn
yarn create xplora-app my-app
```

## 📦 Fitur Template

Template aplikasi yang dibuat mencakup:

- TypeScript configuration
- React setup
- Static site generation
- File system routing
- Development server
- Build configuration
- Hot Module Replacement (HMR)
- Incremental Static Regeneration (ISR)

## 🛠️ Struktur Project

```text
my-app/
├── src/
│   ├── app/
│   │   └── page.tsx
│   ├── components/
│   └── static/
│       └── getStaticProps.ts
├── public/
├── xplora.config.ts
├── tsconfig.json
└── package.json
```

## 📚 Scripts

Setelah project dibuat, Anda dapat menggunakan script berikut:

```bash
# Development
bun run dev

# Build static site
bun run build

# Preview static site
bun run preview
```

## 🔧 Konfigurasi

Template menyediakan konfigurasi default yang dapat disesuaikan di
`xplora.config.ts`:

```typescript
import { defineConfig } from "xplora";

export default defineConfig({
  static: {
    outputDir: "./dist",
    revalidate: 3600,
    fallback: false,
  },
  build: {
    minify: true,
    sourcemap: true,
  },
});
```

## 🤝 Kontribusi

Kami menyambut kontribusi! Silakan baca [CONTRIBUTING.md](../../CONTRIBUTING.md)
untuk panduan kontribusi.

## 📝 Lisensi

MIT License - lihat [LICENSE](../../LICENSE) untuk detail lebih lanjut.
