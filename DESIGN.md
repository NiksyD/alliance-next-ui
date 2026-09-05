---
name: UCEvents Design System
description: Campus Kinetic — High-energy, community-driven design system for university event discovery, ticketing, and real-time attendance verification.
colors:
  uc-blue: '#1875ba'
  uc-blue-deep: '#0e5289'
  uc-blue-light: '#489fe0'
  uc-blue-container: '#d9eaf7'
  uc-gold: '#f5ba13'
  uc-gold-bright: '#ffd200'
  uc-gold-deep: '#c69400'
  uc-gold-container: '#fff4c7'
  surface: '#ffffff'
  surface-muted: '#f8fafc'
  border: '#e2e8f0'
  text-main: '#0f172a'
  text-muted: '#334155'
  text-subtle: '#64748b'
  success: '#10b981'
  success-container: '#d1fae5'
  danger: '#ef4444'
  danger-container: '#fee2e2'
typography:
  display:
    fontFamily: 'var(--font-geist-sans), Inter, sans-serif'
    fontSize: 'clamp(2rem, 5vw, 3.5rem)'
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: '-0.02em'
  headline:
    fontFamily: 'var(--font-geist-sans), Inter, sans-serif'
    fontSize: '1.75rem'
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: '-0.01em'
  title:
    fontFamily: 'var(--font-geist-sans), Inter, sans-serif'
    fontSize: '1.25rem'
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: 'var(--font-geist-sans), Inter, sans-serif'
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: 'var(--font-geist-mono), monospace'
    fontSize: '0.75rem'
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: '0.05em'
rounded:
  sm: '6px'
  md: '10px'
  lg: '16px'
  full: '9999px'
spacing:
  xs: '4px'
  sm: '8px'
  md: '16px'
  lg: '24px'
  xl: '32px'
components:
  button-primary:
    backgroundColor: '{colors.uc-blue}'
    textColor: '#ffffff'
    rounded: '{rounded.md}'
    padding: '10px 20px'
  button-primary-hover:
    backgroundColor: '{colors.uc-blue-deep}'
  button-accent:
    backgroundColor: '{colors.uc-gold}'
    textColor: '{colors.text-main}'
    rounded: '{rounded.md}'
    padding: '10px 20px'
  button-accent-hover:
    backgroundColor: '{colors.uc-gold-deep}'
  badge-verified:
    backgroundColor: '{colors.uc-gold-container}'
    textColor: '{colors.uc-gold-deep}'
    rounded: '{rounded.full}'
    padding: '4px 10px'
---

# Design System: UCEvents

## Overview

**Creative North Star: "Campus Kinetic"**

UCEvents pairs the institutional credibility of university leadership with the spirited, dynamic energy of student community life. The visual system balances two primary modes: **Persuade** for event showcases, club spotlights, and ticket claiming, and **Operate** for rapid QR scanning, officer check-in counters, and participant rosters.

The experience is clean, modern, and high-velocity—taking cues from top-tier modern productivity software (Linear, Notion) while preserving authentic collegiate pride. Surfaces feature crisp borders, tactile elevation, and intentional high-contrast signifiers for critical event statuses (Live Now, Checked-In, Capacity Warning).

**Key Characteristics:**

- **Institutional Confidence**: Anchored by UC Blue (`#1875ba`) for trustworthy authority and core user journeys.
- **Achievement & Celebration**: Energized by UC Gold (`#f5ba13`) for badges, verified attendance, and milestone highlights.
- **Speed & Clarity**: Monospace data chips, high-contrast badges, and instant visual feedback for real-time check-in desk operations.

---

## Colors

The color palette is composed of an institutional anchor, a high-value celebration accent, and a crisp Slate structural scale.

### Primary (UC Blue Scale)

- **UC Blue** (`#1875ba`): Primary actions, active navigation items, brand anchor marks, and critical CTAs.
- **UC Blue Deep** (`#0e5289`): Hover/active pressed states, high-contrast headings on blue tinted surfaces.
- **UC Blue Light** (`#489fe0`): Interactive secondary accents, focus halos, and informational borders.
- **UC Blue Container** (`#d9eaf7`): Soft tinted card backdrops, subtle selection states, and informational callouts.

### Secondary / Accent (UC Gold Scale)

- **UC Gold** (`#f5ba13`): Official institution accent for verified check-in badges, ticket stubs, and achievements.
- **UC Gold Bright** (`#ffd200`): Highlight accents, star ratings, and celebratory alert pings.
- **UC Gold Deep** (`#c69400`): Text contrast on light gold backgrounds and active gold borders.
- **UC Gold Container** (`#fff4c7`): Soft badge backdrops for honors, verified attendance, and premium passes.

### Neutral (Slate Scale)

- **Surface Pure** (`#ffffff`): Modal dialogs, ticket passes, dropdown menus, and main card bodies.
- **Canvas Muted** (`#f8fafc`): Page-level canvas background (`slate-50`).
- **Border Crisp** (`#e2e8f0`): Card separators, table gridlines, and input strokes (`slate-200`).
- **Text Headings** (`#0f172a`): High-emphasis typography and primary numbers (`slate-900`).
- **Text Body** (`#334155`): Readable narrative, descriptions, and labels (`slate-700`).
- **Text Secondary** (`#64748b`): Timestamps, metadata, venues, and placeholder copy (`slate-500`).

### Semantic Status

- **Success / Checked In** (`#10b981` / `#d1fae5`): Verified attendee scan, confirmed registration.
- **Danger / Capacity Reached** (`#ef4444` / `#fee2e2`): Event at capacity, invalid pass, revoked access.

### Named Rules

**The Verification Contrast Rule.** Gold badges must always pair with `#c69400` or `#0f172a` text. Never place pure white text on UC Gold backgrounds due to accessibility contrast requirements.

**The Functional Blue Rule.** UC Blue is reserved for navigation, primary links, and conclusive submission actions (Register, Scan, Confirm). It is never used as a decorative background wash across entire viewports.

---

## Typography

**Display Font:** `Geist Sans`, `Inter`, sans-serif  
**Body Font:** `Geist Sans`, `Inter`, sans-serif  
**Data/Code Font:** `Geist Mono`, monospace

**Character:** Clean, crisp geometric sans-serif that ensures rapid readability under varying lighting conditions (e.g. mobile outdoors at campus gates). Monospace is utilized strictly for numeric metrics, pass tokens, and timestamps.

### Hierarchy

- **Display** (Bold 700, `clamp(2rem, 5vw, 3.5rem)`, `1.1`): Hero page headlines, event festival titles.
- **Headline** (SemiBold 600, `1.75rem` / `28px`, `1.25`): Section titles, organization names.
- **Title** (SemiBold 600, `1.25rem` / `20px`, `1.35`): Event card titles, modal dialog headers.
- **Body** (Regular 400, `1rem` / `16px`, `1.5`): General descriptions, rules, instructions.
- **Label / Metric** (SemiBold 600, `0.75rem` / `12px`, `1.4`, tracking `0.05em`, Monospace): Event dates, QR pass IDs, live headcount badges.

---

## Layout

- **Container Scale**: Max container width of `1280px` (`max-w-7xl`) for desktop landing and event galleries; centered with `px-4 sm:px-6 lg:px-8`.
- **Rhythm Scale**: 8pt grid basis. Micro gaps: `8px` (`gap-2`), standard card spacing: `16px` (`gap-4`), section separators: `32px` to `64px` (`py-8` to `py-16`).
- **Responsive Breakpoints**:
  - `sm` (640px): Stacked forms transition to horizontal filter bars.
  - `md` (768px): Dual column event grids; drawer menus transition to sidebars.
  - `lg` (1024px): Three-column event discovery cards and full check-in analytics rosters.

---

## Elevation & Depth

UCEvents uses a **tactile layered depth** model rather than heavy blur shadows. Surfaces feel crisp, grounded, and clean.

### Shadow Vocabulary

- **Resting Surface** (`0 1px 2px 0 rgb(0 0 0 / 0.05)`): Subtle separation between card tiles and the `slate-50` canvas.
- **Hover Lift** (`0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`): Applied on interactive event cards and primary action buttons upon mouse hover (`translate-y-[-2px]`).
- **Modal / HUD Overlay** (`0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)`): Floating QR code viewer and check-in confirmation sheets.

### Named Rules

**The Border-First Elevation Rule.** All floating surfaces (cards, modals, dropdowns) must have an explicit 1px border (`border-slate-200`) alongside subtle box shadows to guarantee optical definition on varying displays.

---

## Shapes

- **Interactive Elements & Buttons**: Medium radius (`rounded-lg` / `8px` - `10px`).
- **Cards & Event Tiles**: Generous radius (`rounded-xl` / `12px` - `16px`).
- **Badges, Counter Pills & Avatars**: Full pill radius (`rounded-full`).
- **QR Code Bracket Framing**: Clean square framing with subtle inward corner accents.

---

## Components

### 1. Primary Button

- **Shape**: `rounded-lg` (8px), padding `10px 20px`.
- **Style**: Background `#1875ba`, text `#ffffff`, font weight 600.
- **Interaction**: Hover shifts to `#0e5289` with subtle `-1px` vertical lift.

### 2. Event Ticket Card (Signature Component)

- **Style**: Pure white `#ffffff` surface, 1px `border-slate-200`, `rounded-xl`.
- **Anatomy**:
  - Top: Event cover banner with category pill badge.
  - Middle: Date & Time in monospace label, high-contrast title, venue icon row.
  - Bottom: Live attendee capacity meter and "Register" / "View Pass" button.
- **Hover State**: Border shifts to `--uc-blue-light`, shadow elevates slightly.

### 3. QR Attendance HUD (Signature Component)

- **Style**: Centered high-density scan target with animated scanning line or corner brackets in `--uc-blue`.
- **Feedback State**: Instant green flash (`#10b981`) and haptic pulse on valid check-in with attendee name pop-in.

### 4. Status Badges & Pills

- **Verified Attendee**: `bg-[#fff4c7] text-[#c69400] border border-[#f5ba13]/30`.
- **Live Now**: `bg-red-50 text-red-600 border border-red-200` with pulsing dot.
- **Open Capacity**: `bg-emerald-50 text-emerald-700 border border-emerald-200`.

---

## Do's and Don'ts

### Do:

- **Do** emphasize high contrast between text and background on all scanning and pass check-in screens.
- **Do** use uppercase monospace text for event timestamps, ticket codes, and counter metrics (`12:30 PM`, `PASS-#9842`).
- **Do** keep button copy action-oriented and unambiguous ("Claim Pass", "Check In Student", "Download Roster").
- **Do** provide immediate auditory and visual confirmation states during door scanning.

### Don't:

- **Don't** use white text over UC Gold backgrounds—it fails WCAG AA legibility.
- **Don't** hide critical event metadata (venue, time, capacity) behind nested clicks.
- **Don't** use slow, floaty decorative animations that delay gate check-in workflows.
- **Don't** create unbordered pure white cards on light gray backgrounds.
