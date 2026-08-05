---
name: Pixel and Paper
colors:
  surface: '#111416'
  surface-dim: '#111416'
  surface-bright: '#37393c'
  surface-container-lowest: '#0c0f11'
  surface-container-low: '#191c1e'
  surface-container: '#1d2022'
  surface-container-high: '#272a2c'
  surface-container-highest: '#323537'
  on-surface: '#e1e2e5'
  on-surface-variant: '#bccabb'
  inverse-surface: '#e1e2e5'
  inverse-on-surface: '#2e3133'
  outline: '#869486'
  outline-variant: '#3d4a3e'
  surface-tint: '#4de082'
  primary: '#6bfb9a'
  on-primary: '#003919'
  primary-container: '#4ade80'
  on-primary-container: '#005e2d'
  inverse-primary: '#006d36'
  secondary: '#4ae176'
  on-secondary: '#003915'
  secondary-container: '#00b954'
  on-secondary-container: '#004119'
  tertiary: '#8df6b2'
  on-tertiary: '#00391d'
  tertiary-container: '#70d998'
  on-tertiary-container: '#005e34'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6dfe9c'
  primary-fixed-dim: '#4de082'
  on-primary-fixed: '#00210c'
  on-primary-fixed-variant: '#005227'
  secondary-fixed: '#6bff8f'
  secondary-fixed-dim: '#4ae176'
  on-secondary-fixed: '#002109'
  on-secondary-fixed-variant: '#005321'
  tertiary-fixed: '#8ff8b4'
  tertiary-fixed-dim: '#73db9a'
  on-tertiary-fixed: '#00210f'
  on-tertiary-fixed-variant: '#00522d'
  background: '#111416'
  on-background: '#e1e2e5'
  surface-variant: '#323537'
  bg-secondary: '#151A1D'
  bg-elevated: '#1B2024'
  text-primary: '#F5F7F8'
  text-secondary: '#C8CDD1'
  text-muted: '#8C949C'
  text-disabled: '#5E656D'
  status-success: '#4ADE80'
  status-warning: '#FACC15'
  status-danger: '#F87171'
  status-info: '#60A5FA'
  border-subtle: rgba(255, 255, 255, 0.06)
  border-strong: rgba(255, 255, 255, 0.12)
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.5'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.4'
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  scale-xs: 4px
  scale-sm: 8px
  scale-md: 16px
  scale-lg: 24px
  scale-xl: 32px
  scale-2xl: 48px
  gutter: 24px
  margin: 32px
  max-width: 1200px
---

# Pixel and Paper — Internal Platform UI Architecture & Design Spec

## 1. Design Tokens

### Color Palette
- **bg-primary**: #0E1113 (Deep charcoal-black, base canvas)
- **bg-secondary**: #151A1D (Card surfaces, secondary layout blocks)
- **bg-elevated**: #1B2024 (Floating panels, dropdowns, command palette)
- **text-primary**: #F5F7F8 (High contrast headings/body)
- **text-secondary**: #C8CDD1 (Subheadings, secondary copy)
- **text-muted**: #8C949C (Captions, labels, de-emphasized metadata)
- **text-disabled**: #5E656D (Inactive states)
- **accent-primary**: #4ADE80 (Vibrant green, primary actions only)
- **accent-dark**: #22C55E (Pressed states, dark borders)
- **accent-light**: #86EFAC (Subtle highlights, progress bars)
- **status-success**: #4ADE80
- **status-warning**: #FACC15
- **status-danger**: #F87171
- **status-info**: #60A5FA
- **border-subtle**: rgba(255,255,255,0.06)
- **border-strong**: rgba(255,255,255,0.12)

### Typography
- **Font Family**: 'Inter', sans-serif
- **Font Display**: 'Instrument Serif', serif (Hero/marketing surfaces only)
- **H1**: 40px / Semibold / -0.02em
- **H2**: 32px / Semibold / -0.02em
- **H3**: 24px / Medium / -0.01em
- **H4**: 20px / Medium
- **Body Large**: 18px / Regular
- **Body**: 16px / Regular
- **Small**: 14px / Regular
- **Caption**: 12px / Regular

### Spacing & Layout
- **Scale**: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96
- **Radius**: Card 16px, Button/Input 12px, Modal 20px, Panel 18px
- **Grid**: 12-column, 1200px content width, 24px gutter, 32px margins
- **Shadow**: 0 8px 32px rgba(0,0,0,0.18) (Soft elevation)

## 2. Core UI Components

### Navigation
- **Sidebar**: Persistent, left-side. Expanded (240px) or Collapsed (72px).
- **Breadcrumbs**: `Clients / Acme Co. / Q3 Launch Video` — replaces traditional "back" navigation.
- **Top Bar**: Minimalist. Global Search (Center-Left) + Notifications + Profile (Right).

### Elements
- **Button**: Primary (Accent fill), Secondary (Border-subtle), Ghost (No border), Danger (Text-danger).
- **StatusPill**: Text label + subtle background tint + 4px dot.
- **AIChip**: Small badge labeled "AI Suggested" for machine-generated segments.
- **TranscriptLineRow**: Interactive row with line text, output type dropdown, confidence indicator, and status.

## 3. Interaction & Motion
- **Easing**: `cubic-bezier(.2,.8,.2,1)`
- **Hover**: 1.02 scale + soft glow, 200ms.
- **Transitions**: 250ms slide + fade for panel entrances.
- **AI Streaming**: Staggered entrance (40ms) for newly parsed transcript lines.
