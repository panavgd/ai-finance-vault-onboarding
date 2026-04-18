# Design Brief

## Direction
Premium Dark Financial Fintech — luxury wealth vault platform with AI-intelligence, combining warm amber/gold accents on deep charcoal for trust, security, and sophistication.

## Tone
Refined and innovative: luxury fintech meets futuristic AI, all executed with restraint and elegance rather than gloss. Deep, warm charcoal base signals trust; gold/amber accents reward precision and progress.

## Differentiation
Subtle animated circuit board / neural network pattern overlay on backgrounds reinforces AI positioning; smooth step transitions with progress bar communicate progression and forward momentum.

## Color Palette

| Token      | OKLCH        | Role                                       |
| ---------- | ------------ | ------------------------------------------ |
| background | 0.14 0.015 50  | Deep warm charcoal (dark mode primary)    |
| foreground | 0.92 0.01 60   | Warm off-white text on dark              |
| card       | 0.18 0.018 50  | Slightly elevated card surface            |
| primary    | 0.72 0.17 70   | Warm gold/amber (buttons, progress, CTA) |
| accent     | 0.72 0.17 70   | Same as primary; unified accent system   |
| muted      | 0.22 0.02 50   | Subtle secondary surface                  |
| destructive | 0.65 0.19 22  | Red for error/destructive actions        |

## Typography
- Display: Space Grotesk — geometric, tech-forward, headings and hero text
- Body: Satoshi — approachable premium, form labels, descriptions, body copy
- Scale: hero `text-5xl md:text-7xl font-bold tracking-tight`, h2 `text-3xl md:text-4xl font-bold`, label `text-sm font-semibold tracking-widest`, body `text-base md:text-lg`

## Elevation & Depth
Layered surface hierarchy: background (darkest), card (subtle lift), popover/elevated (shadow emphasis). All shadows use warm charcoal with opacity; no sharp edges, all borders use muted accent colors at 20% opacity.

## Structural Zones
| Zone    | Background              | Border                | Notes                                    |
| ------- | ----------------------- | --------------------- | ---------------------------------------- |
| Header  | bg-background           | border-border/20      | Sticky progress bar with warm gold fill |
| Content | bg-background           | —                     | Centered card container, max-w-lg       |
| Footer  | bg-background           | border-border/20      | CTA button zone, fade gradient overlay  |

## Spacing & Rhythm
Spacious rhythm: sections gap 6rem (24px baseline + breathing room). Cards use 1.5rem internal padding. Form inputs and buttons grouped with 0.75rem gaps. All transitions use 300ms ease-out cubic-bezier.

## Component Patterns
- Buttons: rounded-lg, gradient-warm fill, text-primary-foreground, shadow-elevated on hover
- Cards: rounded-lg, bg-card, border border-border/20, shadow-subtle
- Badges: rounded-full, bg-accent/10, text-accent, small text-xs font-semibold
- Progress: linear bar with gradient-warm fill, smooth increment animation

## Motion
- Entrance: fade-in + slide-up (8px) over 300ms, staggered per form field
- Hover: shadow depth increase, color brightening (accent glow), 150ms smooth
- Decorative: subtle pulsing on CTA buttons, progress bar fill animation

## Constraints
- Dark mode only (charcoal base)
- Mobile-first responsive (320px+, tablet 768px+, desktop 1024px+)
- Form fields fully accessible (labels, ARIA, error states)
- No external gradient libraries; use CSS gradients and warm gold palette

## Signature Detail
Animated circuit board background pattern (low opacity, 8-10%) creates AI positioning while maintaining focus on onboarding content; paired with smooth step transitions and gold progress bar for premium, forward-looking UX.
