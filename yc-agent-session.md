# ConditionLock — YC Coding Agent Session Export

**Project:** ConditionLock
**One-line description:** Verified condition records for physical handoffs, starting with rental vehicles.
**AI tools used:** Replit Agent, ChatGPT, Gemini

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript 5.9 |
| Build | Vite + pnpm workspaces (monorepo) |
| Styling | Tailwind CSS + shadcn/ui |
| Local storage | Dexie v4 (IndexedDB) |
| Hashing | Web Crypto API — SHA-256, browser-native |
| PDF export | jsPDF + jspdf-autotable |
| ZIP export | JSZip |
| Signatures | signature_pad |
| Animations | framer-motion |
| Icons | lucide-react |
| Routing | Wouter |
| Backend | None — fully local, no server |

---

## Product Direction and Evolution

ConditionLock started as a general property-condition documentation tool for rentals, sales, and handoffs. Through the session, the focus sharpened to rental vehicles as the primary launch wedge — specifically rental cars, moving trucks, cargo vans, trailers, and car-sharing trips. The broader packet system (hotels, Airbnbs, apartments, property sales, equipment rentals, business changeovers) was built in parallel but positioned as a secondary surface.

Key direction shifts during the session:

- **Rebranded from ProofPacket to ConditionLock** — complete rename across all user-facing copy, file naming patterns, disclaimers, PWA metadata, and brand assets. Database name preserved internally to avoid breaking existing user data.
- **Evidence photo capture moved fully in-app** — replaced `<input capture="environment">` (which saves to camera roll on iOS) with a custom `getUserMedia` camera component. Photos captured through the app are stored only in IndexedDB and cannot be imported from the device gallery, making them harder to dispute.
- **Tag-based evidence system** — added per-checklist-item evidence cards (`ConditionEvidence` type) with severity tagging, photo capture, and inline notes directly on checklist conditions.
- **PDF restructured** — added a dedicated "Evidence by Condition" section grouping photos by checklist item; general photos moved to a separate section.
- **Positioning tightened** — primary tagline: *"Lock in the condition before there's a dispute."* Secondary: *"Verified records for rentals, returns, sales, claims, and handoffs."*

---

## Major Features Implemented

### Packet Types

- **Rental Car Packet** — works with Avis, Budget, Enterprise, Hertz, National, Alamo, Sixt, Turo, Getaround, Zipcar, and any rental company
- **Moving Truck / Van Packet** — U-Haul, Penske, Budget Truck, Enterprise Truck, Ryder, Home Depot, and others
- **Trailer / Tow Equipment Packet**
- **Company Vehicle Handoff** — fleet cars, delivery vans, service trucks, pool vehicles, employer-assigned vehicles
- **Military / Government Travel Documentation** — local organization and manual export only; explicitly does not integrate with DTS, military claims systems, or government travel systems
- **Hotel, Airbnb / STR, Apartment / Home, Property Sale, Vehicle Sale, Business Lease, Business Changeover, Equipment Rental, Moving / Storage, Accident Claim, Custom** — full template set included

### Documentation & Evidence

- **Original-quality photo storage** — photos stored as raw Blobs in IndexedDB at full resolution, never compressed or re-encoded
- **In-app-only evidence capture** — custom `InAppCamera` component using `getUserMedia`; photos stored only inside the app, not saved to the device camera roll on any platform
- **Gallery import blocked for evidence** — document import input restricted to PDF/doc/txt; `image/*` excluded to prevent unverified gallery photos from entering the verified evidence chain
- **Multi-select status tags** — checklist items support damage/concern/note tags with severity levels
- **Per-condition evidence cards** — inline camera, notes, and severity tagging directly on each checklist condition
- **Documents & receipts** — attach PDFs, agreements, and supporting documents; labeled as imported (not in-app captured) in the manifest
- **Activity history** — timestamped log of all packet events and status changes
- **Required shot score** — tracks how many recommended photo angles have been covered per packet
- **Custom entries** — free-form checklist items and custom packet types

### Exports & Verification

- **PDF Condition Report** — `ConditionLock_[Title]_[Date]_Report.pdf`; includes evidence-by-condition section, general photos, checklist summary, signatures, disclaimers
- **Verified Record export** — `ConditionLock_[Title]_[Date]_Manifest.json`; SHA-256 hash manifest for every photo, self-hashed manifest for tamper detection
- **Receiver-side Verify Packet mode** — upload manifest + photo files or a ZIP; hashes computed locally and compared against the manifest; results: verified / missing / hash mismatch / extra
- **Full Archive ZIP** — `ConditionLock_[Title]_[Date]_Archive.zip`; includes packet JSON, manifest, PDF, original photos, checksums, README, DISCLAIMERS
- **Photos ZIP** — `ConditionLock_[Title]_[Date]_Photos.zip`; original-quality photos only (Business Pro feature)
- **Dispute summary** — auto-generated text block citing odometer/fuel records, photo evidence, and verification manifest for rental disputes
- **Travel documentation summary** — military/government travel context block

### Archive Import & Restore

- Import Full Packet Archive ZIP → restores packet and original-quality photos into IndexedDB
- Duplicate detection with replace/duplicate choice
- JSON backup and restore (full data export including photos serialized as base64)

### Pricing & Entitlement

| Feature | Trial (3 days) | ConditionLock Pro | Business Pro |
|---|---|---|---|
| Unlimited packets & photos | ✓ | ✓ | ✓ |
| Signatures | ✓ | ✓ | ✓ |
| JSON backup | ✓ | ✓ | ✓ |
| Verified export | ✓ | ✓ | ✓ |
| Archive export | ✓ | ✓ | ✓ |
| Photos ZIP | ✓ | — | ✓ |
| Save verifications | ✓ | — | ✓ |
| **Price** | $0 | **$14.99 one-time** | **$39.99 one-time** |

- Pro-to-Business upgrade: pay only the $25.00 difference
- 3-day trial gives full Business-level access with no feature restrictions
- Entitlement stored in `localStorage` key `pp_entitlement_sim` for development simulation
- Production path: RevenueCat + App Store / Google Play; product IDs `com.conditionlock.app.pro` / `com.conditionlock.app.business`
- Platform purchase language: purchases tied to app store account; cross-platform (iOS ↔ Android) transfers not supported by app stores

---

## Product Constraints (Non-Negotiable)

- No backend, no server, no cloud sync
- No user accounts
- No analytics or telemetry
- No server-side verification — all hashing runs in the browser via Web Crypto API
- No gallery uploads for verified evidence photos — in-app capture only
- Imported documents (PDFs, etc.) are allowed but labeled as `source: 'import'` in the manifest, distinct from `source: 'in_app_camera'`
- No integration with DTS, military claims systems, government travel systems, or any rental company API (current exports are API-free, manual-attach workflows)

---

## Key Build & Debugging Steps

### Build command

```bash
PORT=3000 BASE_PATH=/ pnpm --filter "./artifacts/proofpacket" run build
```

- `PORT` and `BASE_PATH` must be set; the Vite config reads both from environment
- Build also runs as part of the Replit workflow with env vars injected automatically

### Typecheck command

```bash
pnpm --filter @workspace/proofpacket run typecheck
# or full workspace:
pnpm run typecheck
```

Typecheck passed cleanly at every major milestone. No type errors introduced by the rename or feature additions.

### Notable debugging decisions

- **Dexie DB name preserved** — `super('ProofPacketDB')` in `db.ts` was intentionally not renamed during the ProofPacket → ConditionLock rebrand. Changing the Dexie database name string opens a new IndexedDB database, orphaning all existing user data. The TypeScript class was renamed to `ProofPacketDB` internally but the string identifier passed to Dexie was left as `'ProofPacketDB'`.
- **`getUserMedia` vs `<input capture>`** — iOS saves a copy of any photo taken through a file input (even with `capture="environment"`) to the camera roll at the OS level. This is OS behavior the app cannot prevent. Switching to `getUserMedia` + canvas capture avoids the OS save entirely; the frame is drawn to a canvas element and exported as a Blob that only exists in memory and then IndexedDB.
- **Backwards-compatible manifest type** — `VerificationManifest.appName` type was set to `'ConditionLock' | 'ProofPacket'` (union) after the rename so that old verification manifests generated under the ProofPacket name still validate correctly in the Verify Packet mode.
- **Sourcemap and chunk size warnings** — non-blocking; large chunk sizes result from bundling jsPDF, JSZip, and signature_pad together. No splitting was applied at this stage.
- **`generatePDFBlob` vs `generatePDF`** — `generatePDF` triggers a download directly. Archive export flows pass `undefined` for the PDF blob to skip the embedded PDF in the ZIP and avoid double-downloading.

---

## Current MVP State

- Fully functional local-first web app running on Vite dev server
- All packet types implemented and selectable
- Full checklist, photo, evidence, signature, and log system working
- PDF generation, verified export, full archive ZIP, photos ZIP all functional
- Verify Packet mode functional with SHA-256 comparison
- Archive import/restore working with duplicate detection
- Trial + Pro + Business Pro entitlement system working (dev simulation mode)
- Complete rebrand to ConditionLock with new icon and wordmark
- Typecheck clean, no known runtime errors
- PWA manifest and service worker configured for home screen install

---

## Next Steps

1. **Deploy web / PWA beta** — publish to a public URL for testing; share with rental vehicle users, moving company users, and anyone doing a car handoff
2. **Get testers** — recruit 10–20 people actively renting cars, doing U-Haul moves, or managing company vehicle fleets
3. **Record demo video** — walkthrough of creating a rental car packet, capturing photos, exporting a verified record, and running the receiver-side verify flow
4. **Capacitor wrapper** — wrap with Capacitor for native iOS and Android builds; enables App Store / Google Play distribution and native camera access
5. **RevenueCat integration** — wire up real purchase flows replacing the dev simulation
6. **Optional later:** cloud backup opt-in (user-controlled, encrypted), receiver share links (link-based delivery of verified records without requiring ZIP file transfer)

---

*Generated from Replit Agent session — ConditionLock build, May 2026.*
