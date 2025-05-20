# XploraJS React 🔄

Package React untuk XploraJS yang menyediakan integrasi React dan static site
generation.

## 🚀 Fitur

- Static Site Generation (SSG)
- React component support
- Incremental Static Regeneration (ISR)
- TypeScript support
- Hot Module Replacement (HMR)
- Optimized static assets

## 📦 Instalasi

```bash
bun add xplora-react
```

## 🛠️ Penggunaan

### Basic Setup

```typescript
import { generateStaticPage } from "xplora-react";

// Generate static page
await generateStaticPage({
  component: <App />,
  outputPath: "./dist/index.html",
});
```

### Static Data Generation

```typescript
import { getStaticProps } from "xplora-react";

export async function getStaticProps() {
  // Fetch data at build time
  const data = await fetchData();

  return {
    props: {
      data,
    },
    // Revalidate every hour
    revalidate: 3600,
  };
}
```

## 📚 API Reference

### `generateStaticPage`

```typescript
function generateStaticPage(options: {
  component: React.ReactElement;
  outputPath: string;
  props?: Record<string, any>;
}): Promise<void>;
```

### `getStaticProps`

```typescript
function getStaticProps(): Promise<{
  props: Record<string, any>;
  revalidate?: number;
}>;
```

## 🔧 Konfigurasi

Konfigurasi React dapat dilakukan melalui `xplora.config.ts`:

```typescript
import { defineConfig } from "xplora";

export default defineConfig({
  react: {
    // Static generation options
    static: {
      outputDir: "./dist",
      revalidate: 3600, // ISR interval in seconds
      fallback: false,
    },
  },
});
```

## 🤝 Kontribusi

Kami menyambut kontribusi! Silakan baca [CONTRIBUTING.md](../../CONTRIBUTING.md)
untuk panduan kontribusi.

## 📝 Lisensi

MIT License - lihat [LICENSE](../../LICENSE) untuk detail lebih lanjut.
