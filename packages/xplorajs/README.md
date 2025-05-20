# XploraJS Core 🎯

Package utama dari framework XploraJS yang menyediakan fungsionalitas inti untuk static site generation.

## 🚀 Fitur

- CLI tool untuk development dan build
- Development mode dengan SSR untuk kecepatan development
- Production mode dengan SSG untuk performa optimal
- Build system yang cepat
- TypeScript support
- File system routing
- Incremental Static Regeneration (ISR)
- Optimized asset handling

## 📦 Instalasi

```bash
bun add xplora
```

## 🛠️ Penggunaan

### CLI Commands

```bash
# Development server (SSR mode)
xplora dev

# Build static site (SSG mode)
xplora build

# Preview static site
xplora preview
```

### Development Mode

Development mode menggunakan SSR untuk:
- Hot Module Replacement (HMR)
- Instant feedback saat development
- Real-time data fetching
- Tidak perlu rebuild untuk melihat perubahan

### Production Mode

Production mode menggunakan SSG untuk:
- Performa optimal
- SEO yang lebih baik
- Hosting yang lebih murah
- Incremental Static Regeneration (ISR)

### Konfigurasi

Buat file `xplora.config.ts` di root project:

```typescript
import { defineConfig } from 'xplora'

export default defineConfig({
  // Development options
  dev: {
    port: 3000,
    hmr: true
  },
  // Static generation options
  static: {
    outputDir: './dist',
    revalidate: 3600, // ISR interval in seconds
    fallback: false
  },
  // Build options
  build: {
    minify: true,
    sourcemap: true
  }
})
```

## 📚 API Reference

### CLI

- `dev`: Menjalankan development server (SSR mode)
- `build`: Build static site (SSG mode)
- `preview`: Preview static site

### Config Options

- `dev.port`: Port untuk development server
- `dev.hmr`: Enable/disable Hot Module Replacement
- `static.outputDir`: Output directory untuk static files
- `static.revalidate`: Interval ISR dalam detik
- `static.fallback`: Fallback behavior untuk dynamic routes
- `build.minify`: Minify output
- `build.sourcemap`: Generate sourcemaps

## 🤝 Kontribusi

Kami menyambut kontribusi! Silakan baca [CONTRIBUTING.md](../../CONTRIBUTING.md) untuk panduan kontribusi.

## 📝 Lisensi

MIT License - lihat [LICENSE](../../LICENSE) untuk detail lebih lanjut. 