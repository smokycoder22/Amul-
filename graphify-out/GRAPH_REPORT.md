# Graph Report - .  (2026-07-26)

## Corpus Check
- Large corpus: 82 files · ~930,947 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 323 nodes · 402 edges · 34 communities (27 shown, 7 thin omitted)
- Extraction: 98% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 1,200 input · 350 output

## Community Hubs (Navigation)
- API Route Handlers
- Core Production Dependencies
- TypeScript Environment Configuration
- Package Manifest & Scripts
- Admin Views & Components
- Development & Linter Tooling
- Public & Distributor View Pages
- UI Component Config & Utilities
- Product Helper & Data Mapping
- Documentation, Assets & Domain Model
- Storage Bucket Setup Script
- Supabase Integration Verification
- End-to-End System Verification
- Root Layout & Font Configuration
- Product Category Migration Script
- Excel Sample Data Generator
- Database Connection Test Script
- Excel Parser Testing Utility
- Product Viewer Utility Script
- Authentication Test Suite
- Next.js Build Configuration
- Notifications System View
- Fallback Product Mock Data
- Middleware & Route Protection
- Database Schema Creation Script
- Database Health Check Script
- Next.js Type Declarations
- PostCSS Styling Configuration

## God Nodes (most connected - your core abstractions)
1. `query()` - 20 edges
2. `compilerOptions` - 16 edges
3. `requireAdmin()` - 12 edges
4. `Product` - 8 edges
5. `Button()` - 7 edges
6. `parseExcelFile()` - 7 edges
7. `resolveFamilyImages()` - 7 edges
8. `tailwind` - 6 edges
9. `aliases` - 6 edges
10. `Header()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `resolveFamilyImages()`  [EXTRACTED]
  app/api/admin/dashboard-stats/route.ts → lib/product-helper.ts
- `POST()` --calls--> `createAdminSession()`  [EXTRACTED]
  app/api/auth/admin-login/route.ts → lib/auth.ts
- `POST()` --calls--> `createDistributorOTP()`  [EXTRACTED]
  app/api/auth/request-otp/route.ts → lib/auth.ts
- `POST()` --calls--> `verifyDistributorOTP()`  [EXTRACTED]
  app/api/auth/verify-otp/route.ts → lib/auth.ts
- `GET()` --calls--> `query()`  [EXTRACTED]
  app/api/products/route.ts → lib/db.ts

## Import Cycles
- None detected.

## Communities (34 total, 7 thin omitted)

### Community 0 - "API Route Handlers"
Cohesion: 0.09
Nodes (32): FileReport, POST(), GET(), POST(), POST(), POST(), POST(), POST() (+24 more)

### Community 1 - "Core Production Dependencies"
Cohesion: 0.06
Nodes (33): @base-ui/react, bcryptjs, class-variance-authority, clsx, lucide-react, next, dependencies, @base-ui/react (+25 more)

### Community 2 - "TypeScript Environment Configuration"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 3 - "Package Manifest & Scripts"
Cohesion: 0.10
Nodes (20): name, pnpm, onlyBuiltDependencies, private, scripts, build, dev, lint (+12 more)

### Community 4 - "Admin Views & Components"
Cohesion: 0.16
Nodes (9): UploadResultDetail, DBProduct, PendingProduct, SystemLog, PreviewRow, Header(), Button(), buttonVariants (+1 more)

### Community 5 - "Development & Linter Tooling"
Cohesion: 0.10
Nodes (21): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, postcss, tailwindcss, @tailwindcss/postcss (+13 more)

### Community 6 - "Public & Distributor View Pages"
Cohesion: 0.21
Nodes (8): formatPrice(), ProductCard(), ProductCardProps, formatPrice(), Product, ProductTable(), ProductTableProps, SearchFilterProps

### Community 7 - "UI Component Config & Utilities"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 8 - "Product Helper & Data Mapping"
Cohesion: 0.27
Nodes (8): GET(), getProductFamilyName(), resolveFamilyImages(), mockProducts, pFCLIP09, pTONCP25, resolved, testCases

### Community 9 - "Documentation, Assets & Domain Model"
Cohesion: 0.25
Nodes (5): Amul Price Portal, Excel Price Import Workflow, Admin Persona, Distributors Persona, Retailers Persona

### Community 10 - "Storage Bucket Setup Script"
Cohesion: 0.29
Nodes (5): { createClient }, envPath, fs, path, supabase

### Community 11 - "Supabase Integration Verification"
Cohesion: 0.29
Nodes (5): { createClient }, envPath, fs, path, supabaseCorrected

### Community 12 - "End-to-End System Verification"
Cohesion: 0.33
Nodes (6): determineCategory(), envPath, fs, path, { Pool }, runTests()

### Community 13 - "Root Layout & Font Configuration"
Cohesion: 0.33
Nodes (4): geistMono, geistSans, metadata, viewport

### Community 14 - "Product Category Migration Script"
Cohesion: 0.33
Nodes (4): envPath, fs, path, { Pool }

### Community 15 - "Excel Sample Data Generator"
Cohesion: 0.40
Nodes (4): data, wb, ws, XLSX

### Community 16 - "Database Connection Test Script"
Cohesion: 0.40
Nodes (4): envPath, fs, path, { Pool }

### Community 17 - "Excel Parser Testing Utility"
Cohesion: 0.50
Nodes (4): normalizeString(), parseExcelFileTest(), path, XLSX

### Community 18 - "Product Viewer Utility Script"
Cohesion: 0.40
Nodes (4): envPath, fs, path, { Pool }

### Community 19 - "Authentication Test Suite"
Cohesion: 0.40
Nodes (3): { Client }, fs, path

### Community 20 - "Next.js Build Configuration"
Cohesion: 0.50
Nodes (3): __dirname, __filename, nextConfig

## Knowledge Gaps
- **146 isolated node(s):** `UploadResultDetail`, `PendingProduct`, `DBProduct`, `SystemLog`, `PreviewRow` (+141 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `sharp` connect `Package Manifest & Scripts` to `API Route Handlers`?**
  _High betweenness centrality (0.103) - this node is a cross-community bridge._
- **What connects `UploadResultDetail`, `PendingProduct`, `DBProduct` to the rest of the system?**
  _146 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `API Route Handlers` be split into smaller, more focused modules?**
  _Cohesion score 0.09019607843137255 - nodes in this community are weakly interconnected._
- **Should `Core Production Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Should `TypeScript Environment Configuration` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._
- **Should `Package Manifest & Scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `Development & Linter Tooling` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._