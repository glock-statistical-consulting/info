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

## 2026-05-17

### Webhook-Fix + E-Mail-Durchbruch
- **Problem**: Webhook scheiterte — `createClient()` aus `lib/supabase/server.ts` nutzt `cookies()` von Next.js, das in Stripe-Webhooks (kein Browser-Kontext) fehlschlägt
- **Fix**: `lib/supabase/webhook.ts` erstellt — simpler `createClient` aus `@supabase/supabase-js` ohne Cookies
- **Webhook-URL**: Stripe Endpoint von `kevinglock.de` auf `www.kevinglock.de/api/stripe/webhook` geändert (308-Redirect)
- **Migration**: `supabase/migrations/002_create_purchases.sql` — Tabellen `purchases` + `user_access` mit RLS
- **Ergebnis**: Beide E-Mails (Kundenbestätigung + Admin-Benachrichtigung) kommen durch ✅

### E-Mail Corporate Design
- `lib/email.ts` — Komplett überarbeitet:
  - Header mit Logo + "Kevin Glock Statistical Consulting" (#1e3a5f)
  - Strukturierte Download-Liste mit Trennlinien
  - ZIP-Button als CTA im Corporate-Look
  - Footer mit Adresse, E-Mail, Webseite
  - Admin-Mail als styled Table

### pre/prod-Download-Struktur
- `public/downloads/library/pre/` — 177 leere Platzhalter-Dateien für Testbetrieb (keine echten Daten)
- `public/downloads/library/prod/` — 172 echte Dateien aus `local/downloads/` (gitignored, manuell kopiert)
- `lib/downloads.ts` — PREFIX aktuell auf `pre/`, alle Dateinamen an tatsächliche Benennung angepasst:
  - `dictionary_basic.docx` statt `01_diktionaer_abi.docx`
  - `introduction_R_standard.docx` statt `07_einfuehrung_R_bachelor.docx`
  - `cheatsheet_basic.docx` statt `cheatsheet_high_school.docx`
  - usw. (komplette Neukartierung aller 133+ Einträge)

### Library-Bundle wiederhergestellt
- `library_bundle` (49€, alter Key) in products.ts + downloads.ts reaktiviert
- Nachhilfe-UI auf alten Stand zurückgesetzt (User will Buttons morgen neu designen)

### Live-Umschaltung
- **pre/prod-Mechanismus**: In `lib/downloads.ts` Zeile `const PREFIX = "downloads/library/pre"` auf `"downloads/library/prod"` ändern
- **Voraussetzung**: Echte Dateien müssen in `public/downloads/library/prod/` liegen (bereits kopiert)

### Library-Modal (root)
- `local/library-modal.html` als Vorlage für Button-Modal in `nachhilfe.html`
- Button `onclick="stripeCheckout('library_bundle', this)"` → `onclick="openLibraryModal()"`
- 4 Tier-Cards (Basics/Standard/Advanced/Full Access) mit PNG-Icons aus `/img/`
- Featured-Highlight in Blau (#1B263B), Badge in Orange (#FF6600)
- Modal-Layout: flex column mit scrollbarem `.lib-modal-scroll` (overscroll-behavior: contain)
- Wheel-Events via stopPropagation von Lenis entkoppelt
- i18n DE/EN für alle Modal-Texte + Button/Dokument-Texte aktualisiert
- **Status**: fertig, getestet ✅

### Materials-Modal (root)
- "Materialien ansehen" öffnet jetzt Modal statt Anchor-Scroll
- `js/library-data.js` mit allen 180+ Dokumenten in 4 Kategorien
- Gleiches Corporate Design wie Library-Modal
- **Status**: fertig, getestet ✅

### consulting.html
- 3 CTA-Buttons aus Price-Cards entfernt (Advisory/Courses/Project)

### Close-Buttons vereinheitlicht
- `.lib-modal-close` CSS entfernt; Buttons nutzen jetzt `.modal-close` (aus style.css) — gleiche Formatierung wie Contact-Modal
- betrifft: `closeLibraryModal`, `closeMaterialsModal`

### Subtitle + bilingual document names
- `lib_modal_mat_sub`: Zusatz "(zweisprachig verfügbar)" / "(bilingual)"
- Alle 180+ items in library-data.js jetzt mit `nameEn` + `descEn` — renderMaterials() zeigt Titel basierend auf gewählter Sprache

### Bilinguale Duplikate gemergt
- Spickzettel/Cheatsheet-Paare in allen 4 Tiers → je 1 bilingualer Eintrag
- Prüfung/Exam-Paare (Nr. 10–42) → je 1 bilingualer Eintrag
- EN-Versionen (Dossiers) in Full Access bleiben eigenständig (Zusatzcontent)
- Backup: `js/library-data.js.backup`
- Keine Dateien gelöscht

### Backdrop-Blur auf allen Modals
- `.modal-overlay.active` in style.css: `background: rgba(10,10,10,0.6)` + `backdrop-filter: blur(6px)` hinzugefügt
- Betrifft Contact-Modal (library + materials hatten es bereits via `.lib-overlay`)

### Kategorie-Überschriften bereinigt
- `Cheatsheets & Spickzettel` → DE: `Spickzettel`, EN: `Cheatsheets`
- `Prüfungen & Exams` → DE: `Prüfungen`, EN: `Exams`
- `EN-Versionen (Dossiers)` → EN: `English Versions (Dossiers)`

### Feature-Card Hover in Media-Modus entfernt
- `@media (max-width: 1024px)`: `.feature-card` bekommt statischen orange border, Hover neutralisiert
- `@media (max-width: 800px)`: `.features-grid .feature-card` gleiches Verhalten

### Includes-Note in Materials-Modal
- Standard: "+ Alles aus Einstieg" / "+ Everything from Basics"
- Advanced: "+ Alles aus Standard" / "+ Everything from Standard"
- Full Access: "+ Alles aus Advanced" / "+ Everything from Advanced"
- Orange (#FF6600) Textzeile unter Section-Header

### Tier-Card Subtitles erweitert
- Standard: "+ Alles aus Einstieg + Hypothesentests · Regression · SPSS/R" (DE/EN)
- Advanced: "+ Alles aus Standard + Multivariate Methoden · Thesis · Python" (DE/EN)
- Full Access unverändert

### Hover/Click + Body-Scroll-Fix
- `.lib-tier:hover` entfernt: `transform: translateY(-1px)` — ließ oberen Border bei erstem Card verschwinden
- `window.lenis.stop()` / `.start()` bei allen Modals (library, materials, contact)
- `document.body.style.overflow = 'hidden'` bei contact modal ergänzt (fehlte dort)
- `const lenis` → `window.lenis` für globale Zugriffe

### Booking-Modal (nachhilfe.html) — 3-Section-Design
- **Step 1**: Type-Buttons (Anfrage/Nachhilfe/Consulting)
- **Step 2a (Inquiry/Consulting)**: Kontaktformular mit `booking_type` + `booking_service` hidden fields
- **Step 2b (Nachhilfe)**: Level-Grid (Einstieg/Absolventen/Dissertation) + 4 Package-Cards
- Einstieg → Stripe-Checkout; Absolventen/Dissertation/Individuell → Inquiry-Form
- Level-Preise dynamisch: Einstieg 45€, Absolventen 60€, Dissertation 75€ Basis; 10%/15% Rabatt für 5h/10h
- Hero-Button + Advanced/Expert-Card-Button + CTA rufen `openBookingModal()` auf
- Price-Card-Buttons (Basics/Advanced/Expert) entfernt (durch Modal ersetzt)

### Inquiry-Modal auf allen anderen Seiten (index, about, consulting, impressum, datenschutz)
- Einheitliches Modal im Corporate Design: `openInquiryModal()` → Step 1 übersprungen
- Formular-Felder + Überschriften auf #FAFAF8/#163E64 Farbpalette aktualisiert
- `translations.js`: 16 neue DE/EN Keys + angepasste Descriptions

### Globaler White→#FAFAF8 Austausch
- Sämtliche `#fff`, `#ffffff`, `white`, `rgba(255,255,255,…)` → `#FAFAF8` / `rgba(250,250,248,…)`
- Betrifft: alle HTML-Seiten, style.css (root+public), client-portal/app/globals.css, Supabase-Email-Templates
- Textfarbe auf nicht-ausgewählten Level/Type-Buttons auf #163E64 gesetzt (war inherit)

### Offen / Morgen
1. Stripe-Live-Mode aktivieren
