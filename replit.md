# ProofPacket

A mobile-first, fully local web app for documenting property condition before rentals, sales, handoffs, and transfers. All data stored in IndexedDB via Dexie. No accounts, no cloud, no backend.

## Run & Operate

- `pnpm --filter @workspace/proofpacket run dev` — run the web app (preview at `/`)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000, currently unused)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind + shadcn/ui, Wouter routing
- DB: Dexie v3 (IndexedDB), no backend DB
- PDF: jsPDF + jspdf-autotable
- ZIP: JSZip (archive export/import, photo ZIP)
- Crypto: Web Crypto API, SHA-256 (browser-native)
- Signatures: signature_pad
- Animations: framer-motion
- Icons: lucide-react

## Where things live

- `artifacts/proofpacket/src/` — main app
  - `pages/` — Dashboard, Packets, PacketDetail, NewPacket, NewPacketForm, VerifyPacket, Templates, Settings, Pricing
  - `storage/db.ts` — Dexie schema (v2: packets, photos, settings, verificationResults)
  - `storage/actions.ts` — all DB read/write helpers
  - `types/index.ts` — all TypeScript types
  - `utils/crypto.ts` — SHA-256 hashing (Web Crypto API)
  - `utils/manifest.ts` — manifest generation, archive export/import
  - `pdf/generator.ts` — jsPDF report generator
  - `hooks/useTier.ts` — Free/Pro/Business tier system
  - `components/Navigation.tsx` — bottom nav (Home, Packets, New, Verify, Settings)

## Architecture decisions

- **Fully local**: All data in IndexedDB, no server. Hashing via Web Crypto API.
- **Dual workflow**: Dashboard offers "Create Packet" (sender) and "Verify Packet" (receiver) modes in the same app.
- **Tier simulation**: Tier stored in `localStorage` key `pp_tier_sim`. Developer toggles in Settings.
- **Archive format**: JSZip ZIP with packet-data.json, verification-manifest.json, original photos, checksums.txt, README.txt.
- **SHA-256 matching**: Hash-first matching (filename not required to match), with fallback to filename-based mismatch detection.

## Product

**Create Packet mode** (sender):
- Choose packet type (car rental, apartment, sale, etc.)
- Build checklist, add photos, communication logs, signatures
- Export: PDF Report, Verified Packet (manifest + summary), Full Archive ZIP, Photos ZIP

**Verify Packet mode** (receiver):
- Upload verification-manifest.json + photo files or ZIP
- SHA-256 hashes computed locally, compared against manifest
- Results: verified / missing / hash mismatch / extra
- Save results locally (Business tier), export result summary

**Import / Restore**:
- Import Full Packet Archive ZIP → restores packet + photos into IndexedDB
- Duplicate detection with replace/duplicate choice

## Pricing tiers

| Feature | Free | Pro | Business |
|---------|------|-----|----------|
| Packets | 1 | ∞ | ∞ |
| Photos/packet | 15 | ∞ | ∞ |
| Watermark | ✓ | — | — |
| Signatures | — | ✓ | ✓ |
| JSON Backup | — | ✓ | ✓ |
| Verified Export | — | ✓ | ✓ |
| Archive Export | — | ✓ | ✓ |
| Photos ZIP | — | — | ✓ |
| Save Verifications | — | — | ✓ |

## User preferences

- No backend, no accounts, no cloud — everything local only
- Mobile-first layout (max-w-lg, pb-24 for nav)
- Tier stored in localStorage key `pp_tier_sim` for dev simulation
- Use plain disclaimer language — never say "legally certified", "court-approved", etc.

## Gotchas

- `storage.getSettings()` is pure read — call `storage.ensureSettings()` at startup only (in `main.tsx`)
- Dexie DB is version 2 — adding new tables requires incrementing the version
- `generatePDFBlob` in generator.ts calls `generatePDF` internally (triggers download) — avoid calling it from archive flows directly; pass `undefined` for pdfBlob in `exportFullArchive` to skip PDF in ZIP
- JSZip is installed at workspace root; import as `import JSZip from 'jszip'`
- Web Crypto API requires HTTPS or localhost — check `isCryptoAvailable()` before hashing

## Pointers

- See `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
