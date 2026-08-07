# 🌿 hausku — 5 Homepage Design Concepts (Standalone HTML)

> **Purpose:** Client ne complaint ki hai ke current homepage (lime green `#32CD32` + current layout) reference website ki copy lag raha hai.
> **Solution:** 5 bilkul alag UI styles aur color palettes ke standalone HTML pages banayein — sab ek single `.html` file (inline CSS + vanilla JS), koi external dependency nahi. Client ko in options me se pasand ka design chunna hai.

---

## 📁 Folder Structure

```
homepage-designs/
├── DESIGN-PLAN.md            ← yeh file (plan / roadmap)
├── 01-neumorphism.html       ← Design 1: Soft Nature (Neumorphism)
├── 02-skeuomorphism.html     ← Design 2: Craft & Wood (Skeuomorphism)
├── 03-dark-eco.html          ← Design 3: Midnight Forest (Dark + Neon Lime)
├── 04-glassmorphism.html     ← Design 4: Aurora Glass (Glassmorphism)
└── 05-brutalist.html         ← Design 5: Eco Editorial (Brutalist)
```

---

## 🏗️ Common Homepage Sections (sab 5 designs me same content, alag style)

Har design me yeh sections honge (content same, visual treatment alag):

| # | Section | Content |
|---|---------|---------|
| 1 | **Announcement bar** | 🚚 Free shipping from €39 · 🔄 30-day trial · 🇩🇪 Delivery 2–4 days |
| 2 | **Navbar** (sticky) | Logo "hausku" · Home / Products / Sale / About / Contact · Cart icon with count |
| 3 | **Hero** | Eco tagline, bara headline, 2 CTAs ("Shop now", "About us"), product visual, floating eco badges |
| 4 | **Social proof strip** | ⭐ 4.8/5 rating · 50,000+ happy customers · Trusted in DE/AT/CH |
| 5 | **Trust badges** (6) | 🛡️ 5-year warranty · 🚚 Free shipping · 🔄 30-day trial · 💳 Secure payment · 🌍 Climate neutral · 📦 DHL GoGreen |
| 6 | **Categories** | Küche, Haushalt, Snackboxen, Zubehör (4 cards) |
| 7 | **Featured products** (3) | Couchbar Snackbox, Laptopkissen Grau, Brotdose 1400ml — price, rating, "Add to cart" |
| 8 | **Promo banner** | "Summer Sale — 20% off" gradient/pattern banner |
| 9 | **Product showcase 1** | Snackbox — "Personalize your Snackbox" (image left, details right) |
| 10 | **Product showcase 2** | Laptopkissen — "German Engineering" (details left, image right) |
| 11 | **Product showcase 3** | Brotdose — "Stainless Steel Excellence" |
| 12 | **Why hausku** (4 cards) | Sustainability, Quality, Fast shipping, Fair prices |
| 13 | **Testimonials** (3) | German customer reviews with 5-star ratings |
| 14 | **Newsletter** | "Get 10% off your first order" email form |
| 15 | **Footer** | Links, payment badges (Visa, MC, PayPal, Klarna, Apple Pay), legal |

> **Product images:** Koi real image nahi milegi standalone me — har design me **inline SVG illustrations** banayenge (snackbox, laptopkissen, brotdose) jo us design ke style me ho (neumorphic SVG, skeuo SVG, etc). Eco icons bhi inline SVG.

> **Interactions (vanilla JS):** Mobile menu toggle · scroll-reveal animations (IntersectionObserver) · cart counter demo (click = +1) · newsletter form fake submit · back-to-top button.

---

# 🎨 The 5 Designs

---

## Design 1 — Soft Nature (Neumorphism)

**File:** `01-neumorphism.html`

### Vibe
Soft, calm, modern-minimal. Pehli nazar me "premium soft UI". Pure CSS neumorphic shadows (light + dark dual shadow), bilkul flat colors ka koi use nahi.

### Color Palette
| Token | Hex | Use |
|-------|-----|-----|
| Background | `#E8EDE9` | soft gray-green base |
| Surface | `#F2F6F3` | cards, buttons |
| Primary (green) | `#7CB37A` | accents, active states |
| Primary dark | `#4C7A50` | hover/text emphasis |
| Text | `#2E3D33` | headings |
| Text muted | `#6B7A70` | body text |
| Danger | `#D9685C` | sale badges only |

### Typography
- Headings: **"Quicksand"** (600–700)
- Body: **"Inter"** (400–500)

### Key UI Rules
- Buttons: `border-radius: 999px`, neumorphic shadow `box-shadow: 6px 6px 12px rgba(0,0,0,.08), -6px -6px 12px #fff`, hover = inset shadow (button "press" effect)
- Cards: `border-radius: 24px`, soft neumorphic shadows, no borders
- Inputs: **inset** neumorphic (pressed look)
- Navbar: sticky pill bar with neumorphic float
- Hero: neumorphic product card center + floating circular eco badges
- Background: subtle dotted grid pattern (CSS radial-gradient)

### Signature Elements
- 🟢 Dual-shadow soft buttons that "sink" on hover
- Floating animated eco badges around hero product
- Section titles with small leaf SVG icon

---

## Design 2 — Craft & Wood (Skeuomorphism)

**File:** `02-skeuomorphism.html`

### Vibe
Old-school skeuomorphism — realistic textures, depth, "premium German craft" feel. Wood grain, kraft paper, leather stitches, embossed metal. Handcrafted eco products ka perfect match.

### Color Palette
| Token | Hex | Use |
|-------|-----|-----|
| Background | `#F3E9D6` | kraft paper / cream |
| Wood dark | `#6B4423` | hero wood panel |
| Wood light | `#A97C50` | wood grain |
| Forest green | `#2F5233` | primary buttons |
| Olive | `#7A9B57` | accents |
| Text | `#3A2E22` | headings |
| Gold/bronze | `#C9A227` | badges, embossed text |

### Typography
- Headings: **"Playfair Display"** (700) — serif, premium craft
- Body: **"Nunito Sans"** (400)

### Key UI Rules
- Wood grain: pure CSS repeating-linear-gradient texture
- Buttons: forest-green with **3D bevel** (top highlight border + bottom dark border + drop shadow), hover = "pressed in" (translateY + inset shadow)
- Cards: kraft paper texture + embossed border + subtle "stitching" (dashed border) on promo
- Section headers: embossed text (text-shadow) like stamped on wood
- Hero: wood plank panel with engraved tagline, product on a wooden shelf, stamped badges ("Handmade", "5 Year Warranty")
- Background: paper texture (CSS noise via repeating gradients)

### Signature Elements
- 🪵 Wood-grain hero panel with "engraved" title
- 3D bevel buttons with realistic press animation
- Stitched kraft-paper promo banner
- Leather-texture footer strip

---

## Design 3 — Midnight Forest (Dark Eco + Neon Lime)

**File:** `03-dark-eco.html`

### Vibe
Modern dark e-commerce — deep forest greens with neon lime glow. Cyber-eco: organic + techy. Current brand ki lime green yahan dark mode me "glow" ban ke aati hai.

### Color Palette
| Token | Hex | Use |
|-------|-----|-----|
| Background | `#0A120C` | near-black green |
| Surface | `#122017` | cards |
| Surface 2 | `#1A2E1F` | hover states |
| Neon lime | `#A8FF3E` | CTAs, glows, highlights |
| Mint | `#5FE3A2` | secondary accents |
| Text | `#EAF6EC` | headings |
| Text muted | `#8FB396` | body |

### Typography
- Headings: **"Space Grotesk"** (700)
- Body: **"Inter"** (400)

### Key UI Rules
- Buttons: neon lime bg + dark text + **glow** (`box-shadow: 0 0 24px rgba(168,255,62,.45)`), hover = stronger glow
- Cards: dark surface, 1px border `rgba(168,255,62,.15)`, hover = border glows
- Hero: animated **gradient aurora blobs** (green/lime, blur, slow float), big glowing headline (lime gradient text)
- Navbar: glassy dark (`backdrop-filter: blur`), sticky, lime underline on hover
- Background: fixed subtle **particle/star field** (tiny dots via radial-gradient) + green fog at bottom
- Promo banner: dark + lime gradient border, glowing

### Signature Elements
- 🌌 Aurora glow blobs animating in hero
- ✨ Neon glow CTAs
- Animated gradient headline text
- Glass-dark navbar

---

## Design 4 — Aurora Glass (Glassmorphism)

**File:** `04-glassmorphism.html`

### Vibe
Vibrant, fresh, modern — rich gradient background with frosted-glass cards floating on top. Eco + energy: bright greens/teals with warm sunlight accents.

### Color Palette
| Token | Hex | Use |
|-------|-----|-----|
| BG gradient start | `#0E4D3A` | deep emerald |
| BG gradient mid | `#1E8E5F` | vibrant green |
| BG gradient end | `#7ED957` | lime |
| Glass | `rgba(255,255,255,.12)` | panels |
| Glass border | `rgba(255,255,255,.28)` | panel borders |
| Accent light | `#B9FBC0` | highlights |
| Text (on glass) | `#FFFFFF` | headings |
| Text muted | `rgba(255,255,255,.75)` | body |

### Typography
- Headings: **"Sora"** (600–700)
- Body: **"Inter"** (400)

### Key UI Rules
- Background: animated **aurora gradient** (large blurred color blobs slowly moving)
- Cards: `backdrop-filter: blur(18px)`, glass bg, 1px white/28 border, big radius (24px), soft shadow
- Buttons: solid white or lime with dark text, rounded-full, hover = scale + brighter glow; secondary = glass button
- Hero: full glass panel with headline + floating product card in glass frame, floating glass chips ("Climate Neutral", "4.8★")
- Navbar: glass pill floating over hero
- Newsletter/footer: dark glass on gradient

### Signature Elements
- 🌈 Animated aurora gradient background (pure CSS)
- 🧊 Frosted glass cards everywhere
- Floating glass product showcase
- Gradient glass promo banner

---

## Design 5 — Eco Editorial (Brutalist / Retro Print)

**File:** `05-brutalist.html`

### Vibe
Bold, loud, unapologetic — 90s eco-activist poster aesthetic. Harsh borders, huge type, sticker badges, bright high-contrast colors. Reference site se 100% alag, super memorable.

### Color Palette
| Token | Hex | Use |
|-------|-----|-----|
| Cream | `#F5EFE0` | main background |
| Ink black | `#141414` | text, borders |
| Forest | `#1E5631` | primary buttons |
| Lime | `#C6F430` | highlight / badges |
| Tomato | `#FF5A3C` | sale / accents |
| Sky | `#4EC5F0` | secondary accents |

### Typography
- Headings: **"Archivo Black"** (uppercase, huge)
- Body: **"Space Grotesk"** (400–500)

### Key UI Rules
- Sharp corners: `border-radius: 0` almost everywhere
- Thick black borders (`border: 3px solid #141414`), hard offset shadows (`box-shadow: 6px 6px 0 #141414`), hover = shadow moves (playful press)
- Buttons: chunky, uppercase, offset hard shadow, hover = translate
- Cards: sticker-style with rotated badges ("SALE", "BIO", "MADE IN GERMANY")
- Hero: huge uppercase headline, marquee ticker strip (CSS animation), giant sticker circle
- Background: cream + subtle halftone dots + torn-paper SVG edges
- Marquee: scrolling text strip "FREE SHIPPING ★ MADE IN GERMANY ★ CLIMATE NEUTRAL ★"

### Signature Elements
- 📢 CSS marquee announcement ticker
- 🏷️ Rotated sticker badges on products
- Harsh offset shadows + sharp corners
- Giant condensed typography

---

## 🔄 Design Comparison Table

| | Design 1 | Design 2 | Design 3 | Design 4 | Design 5 |
|---|---|---|---|---|---|
| **Style** | Neumorphism | Skeuomorphism | Dark + Neon | Glassmorphism | Brutalist |
| **Mood** | Calm, premium | Handcrafted | Modern, techy | Vibrant, fresh | Bold, loud |
| **Base color** | Soft green-gray | Wood + kraft | Near-black green | Emerald→lime gradient | Cream + ink |
| **Accent** | Sage green | Forest + gold | Neon lime | White/lime | Lime + tomato |
| **Corners** | 24px soft | Mixed | 16px | 24px | Sharp 0px |
| **Headline font** | Quicksand | Playfair Display | Space Grotesk | Sora | Archivo Black |
| **Shadow style** | Dual soft | Bevel 3D | Neon glow | Soft + blur | Hard offset |
| **Background** | Dot grid | Wood/paper | Aurora blobs + stars | Aurora gradient | Halftone + marquee |
| **Best for client who wants…** | "premium & calm" | "authentic craft" | "modern & cool" | "vibrant & energetic" | "memorable & different" |

---

## 🛠️ Build Notes (har HTML file me)

1. **Single file:** sab CSS `<style>` me, sab JS `<script>` me, images = inline SVG. Zero external requests except Google Fonts.
2. **Google Fonts** via one `<link>` (preconnect + font css).
3. **Responsive:** mobile-first, breakpoints at 640 / 768 / 1024 / 1280. Hamburger menu mobile pe.
4. **Accessibility:** semantic tags (`header/nav/main/section/footer`), aria-labels on icon buttons, `alt` on SVG images (role="img" + title).
5. **Micro-interactions:** hover states, button press, scroll reveal, floating animations, marquee (design 5).
6. **Copy:** real hausku content (Snackbox "Couchbar", Laptopkissen, Brotdose 1400ml, German reviews from homepage). Prices: Snackbox €29.90, Laptopkissen €39.90, Brotdose €34.90 (sample).
7. **Demo touches:** cart badge increments on "Add to cart" click · toast notification "Added to cart ✓" · newsletter fake submit success message.
8. **Per-design filename + `<title>` + meta description** set accordingly.

---

## ✅ Build Order (Next Chats)

1. `01-neumorphism.html` — Soft Nature
2. `02-skeuomorphism.html` — Craft & Wood
3. `03-dark-eco.html` — Midnight Forest
4. `04-glassmorphism.html` — Aurora Glass
5. `05-brutalist.html` — Eco Editorial

> Har chat me 1 file banayenge (user ke kehne ke mutabiq "one by one"), pehle design 1 se. Plan me koi bhi cheez change karni ho to bata dein.
