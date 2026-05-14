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
  - `hooks/useTier.ts` — trial/Pro/Business tier system + RENTAL_VEHICLE_TYPES, isRentalVehicleType()
  - `hooks/useTrial.ts` — 3-day trial state, entitlement simulation
  - `components/Navigation.tsx` — bottom nav (Home, Packets, New, Verify, Settings)

## Architecture decisions

- **Fully local**: All data in IndexedDB, no server. Hashing via Web Crypto API.
- **Dual workflow**: Dashboard offers rental vehicle quick-start cards and "Verify Packet" mode in the same app.
- **Trial model**: 3-day full-access trial (Business-level). Tier = 'trial' | 'pro' | 'business' | 'locked'.
- **Tier simulation**: Entitlement stored in `localStorage` key `pp_entitlement_sim`. Developer toggles in Settings.
- **Archive format**: JSZip ZIP with packet-data.json, verification-manifest.json, original photos, checksums.txt, README.txt.
- **SHA-256 matching**: Hash-first matching (filename not required to match), with fallback to filename-based mismatch detection.

## Positioning

ProofPacket creates verified condition records for physical handoffs, starting with rental vehicles. Most people take photos. ProofPacket tells you what they forget to document.

ProofPacket launches first with rental vehicle proof packets, including rental cars, moving trucks, cargo vans, trailers, car-sharing trips, company vehicle handoffs, and military/government travel documentation. The broader system also supports hotels, Airbnbs, apartments, business handoffs, property sales, equipment transfers, and more.

Military and government travel workflows are designed for local organization and manual export only. ProofPacket does not integrate with DTS, military claims systems, government travel systems, or agency systems.

## Product

**Rental Vehicle focus** (primary launch use case):
- Rental Car Packet — works with Avis, Budget, Enterprise, Hertz, Alamo, Turo, Getaround, Zipcar, and any rental company.
- Moving Truck / Van Packet — works with U-Haul, Penske, Budget Truck, Enterprise Truck, Ryder, Home Depot, and others.
- Trailer / Tow Equipment Packet
- Custom Rental Vehicle Packet (RVs, motorcycles, boats, etc.)

**Other packet types**: Hotel, Airbnb/STR, Apartment/Home, Property Sale, Vehicle Sale, Business Lease, Business Changeover, Equipment Rental, Moving/Storage, Accident Claim, Custom.

**Create Packet mode** (sender):
- Choose packet type; fill in rental company/platform, vehicle details, odometer, fuel/EV battery, accessories
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

## Rental Vehicle — Company / Platform Support

Company names are stored in `packet.details.rentalCompany` (and `packet.companyOrPerson` for display).
Selector options are grouped by type in `NewPacketForm.tsx`:

- **Rental Cars**: Avis, Budget, Enterprise, Hertz, National, Alamo, Sixt, Thrifty, Dollar, Fox
- **Car-sharing**: Turo, Getaround, Zipcar
- **Moving Trucks**: U-Haul, Penske, Budget Truck Rental, Enterprise Truck Rental, Ryder, Home Depot Truck Rental, Lowe's Truck Rental
- **Always**: Local / Independent, Other (triggers free-text field)

ProofPacket is not affiliated with rental companies or car-sharing platforms. It currently creates API-free exports that users can manually attach to email, rental company portals, car-sharing dispute workflows, or claim forms. Future integrations may include rental vehicle companies, fleet operators, car-sharing platforms, and dispute/claims workflows.

Company Vehicle Handoff is designed for future integrations with fleet management systems, internal ticketing tools, HR/onboarding workflows, and maintenance systems. Current exports are API-free and can be attached manually to emails, tickets, fleet records, or internal documentation systems.

## Pricing tiers

| Feature | Trial (3 days) | Pro | Business Pro |
|---------|----------------|-----|--------------|
| Packets | ∞ | ∞ | ∞ |
| Photos/packet | ∞ | ∞ | ∞ |
| Watermark | — | — | — |
| Signatures | ✓ | ✓ | ✓ |
| JSON Backup | ✓ | ✓ | ✓ |
| Verified Export | ✓ | ✓ | ✓ |
| Archive Export | ✓ | ✓ | ✓ |
| Photos ZIP | ✓ | — | ✓ |
| Save Verifications | ✓ | — | ✓ |
| Price | $0 | $14.99 | $39.99 |

## User preferences

- No backend, no accounts, no cloud — everything local only
- Mobile-first layout (max-w-lg, pb-24 for nav)
- Entitlement stored in localStorage key `pp_entitlement_sim` for dev simulation
- Use plain disclaimer language — never say "legally certified", "court-approved", etc.
- Do not use company logos or branding colors that imply affiliation

## Gotchas

- `storage.getSettings()` is pure read — call `storage.ensureSettings()` at startup only (in `main.tsx`)
- Dexie DB is version 2 — adding new tables requires incrementing the version
- `generatePDFBlob` in generator.ts calls `generatePDF` internally (triggers download) — avoid calling it from archive flows directly; pass `undefined` for pdfBlob in `exportFullArchive` to skip PDF in ZIP
- JSZip is installed at workspace root; import as `import JSZip from 'jszip'`
- Web Crypto API requires HTTPS or localhost — check `isCryptoAvailable()` before hashing
- Rental vehicle types: 'car_rental' | 'moving_truck_van' | 'trailer_tow_equipment' | 'custom_rental_vehicle' — use `isRentalVehicleType(type)` from useTier.ts

## Pointers

- See `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
