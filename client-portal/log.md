# Session Log — Stripe Integration

## 2026-05-16

### Setup
- Stripe SDK installiert: `stripe`, `@stripe/stripe-js`, `@stripe/react-stripe-js`
- Resend installiert für E-Mail-Benachrichtigungen
- Stripe-Konto erstellt (Sandbox/Test-Mode)

### API-Schlüssel (Test Mode)
- `pk_test_...` (im .env.local)
- `sk_test_...` (im .env.local, nicht committen)
- Webhook-Secret: `whsec_a5mld...`

### Produkte (in products.ts)
| Produkt | Preis | Typ |
|---------|-------|-----|
| Library Bundle | 49€ | one_time |
| Tutoring Single | 45€ | one_time |
| Tutoring 5h | 202,50€ | one_time |
| Tutoring 10h | 382,50€ | one_time |

### API Endpunkte
- `POST /api/stripe/checkout` — erstellt Checkout Session
- `POST /api/stripe/webhook` — verarbeitet `checkout.session.completed`
- `GET /api/stripe/session` — ruft Session-Daten ab

### Frontend
- `/checkout?productKey=...` — Embedded Checkout (Next.js)
- `/checkout/success?session_id=...` — Download-Links
- `/checkout/cancel` — Abbruch-Seite (Redirect-Fallback)
- `public/js/stripe-checkout.js` — für statische HTML-Seiten (Redirect-Mode)

### E-Mail-Benachrichtigungen
- Resend: Kunde bekommt Bestätigung + Download-Links
- Resend: Admin bekommt Verkaufs-Benachrichtigung
- Noch nicht konfiguriert (kein API-Key)

## 2026-05-16 (Teil 2)

### Produkte in library_bundle → 4-Tier-System umgestellt
Altes Einzelprodukt `library_bundle` (49€) ersetzt durch 4 gestaffelte Bundles:

| Produkt | Preis | Inhalt |
|---------|-------|--------|
| `library_basics` | 9€ | Entscheidungsbaum, Diktionär/Spickzettel/Cheatsheet Abi, Dossiers 10–13, Prüfungen+Exams 10–13 (16 Files) |
| `library_standard` | 24€ | Basics + Bachelor-Diktionär, Code-Einführungen R/Python/SPSS, Dossiers 10–37 (inkl. Qualitative 32–37), Prüfungen+Exams 10–42, Klausur Bachelor (79 Files) |
| `library_advanced` | 39€ | Standard + Master-Diktionär, Master-Code, Dossiers 38–42, Master-Klausur (94 Files) |
| `library_all_access` | 59€ | Advanced + PhD-Diktionär, EN-Versionen en_10–42, Literaturverzeichnis (133 Files) |

### Preisarchitektur
- Charm Pricing (9er-Endungen): 9€ Impulskauf, 24€ Sweet Spot, 39€/59€ Premium-Anker
- Hebelwirkung: All-Access (59€) macht Standard (24€) und Advanced (39€) vernünftig
- Verhältnis Basics→Standard ~2.7x, Advanced→All-Access ~1.5x (Upgrade-Schwelle niedrig)

### Geänderte Dateien
- `lib/stripe/products.ts` — 4 neue Keys, alter `library_bundle` entfernt; Tutoring-Produkte unverändert
- `lib/downloads.ts` — Komplett neu mit 4 Tier-Entries + Item-Matrix (193 Files, gemappt nach Niveau)
- `app/api/download/bundle/route.ts` — Default `"library_bundle"` entfernt, Validation für productKey
- `nachhilfe.html` — Library-Sektion: 1 Karte → 4 Pricing-Cards (Badge, Preis, Feature-Liste, Checkout-Button je Tier)
- `translations.js` — 28 neue Keys (DE+EN), alte `lib_preview_*` + `btn_library_bundle` entfernt, `lib_text` aktualisiert
- Sync root ↔ public für `nachhilfe.html`, `translations.js`, `js/stripe-checkout.js`

### Naming-Konvention (vom User bestätigt)
- Basics (nicht „Abi"), Standard (nicht „Bachelor"), Advanced (nicht „Master"), All-Access (nicht „PhD")

### Validierung
- TypeScript `tsc --noEmit`: keine Fehler
- Alle API-Routen bleiben unverändert kompatibel (nutzen `productKey` generisch)

### Wichtiger Hinweis
Die Download-Dateien in `downloads.ts` referenzieren Pfade wie `downloads/library/entscheidungsbaum_welcher_test.docx`. Diese Dateien existieren aktuell nur in `C:\Users\Kevalon\OneDrive\Documents\GlockConsulting\local\downloads\`, NICHT in `client-portal/public/downloads/library/`. Die Files müssen dorthin kopiert werden, damit Download-API + ZIP-Bundle funktionieren.

### Offen (Update)
1. ~~Webhook-Endpoint in Stripe Dashboard einrichten~~ ✅ (whsec_a5mld... konfiguriert)
2. ~~Resend API-Key holen~~ ✅ (in .env.local + Vercel Dashboard)
3. ~~.env.local mit allen Keys füllen~~ ✅ (Stripe-Keys + Admin-Email gesetzt)
4. **Download-Dateien in `public/downloads/library/` kopieren** (193 Files aus `local/downloads/`)
5. Stripe-Live-Mode aktivieren (nach Testphase)
