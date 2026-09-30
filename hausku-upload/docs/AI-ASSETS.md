# hausku — AI Asset Generation Spec

> Ye document un images/videos ki exact spec hai jo humein AI se generate karwani hain.
> Har asset ka size, style, aur ready-to-use prompt diya gaya hai.
> Generate karne ke baad files ko `public/images/...` me replace karna hai (same filenames = turant live).

---

## 1. Product Photos — SQUARE 1:1 (SABSE IMPORTANT) ⭐

**Problem ye thi:** Cards square (`aspect-square`) hain, lekin 3 photos landscape thi — isliye sides crop ho rahi thi aur client ko "full image nahi aati" laga. **Square photos se ye permanently solve ho jata hai.**

| File (replace) | Product | Current (bad) | Target |
|---|---|---|---|
| `public/images/products/couchbar-snackbox.jpg` | Snackbox | 679×473 landscape | **1024×1024** |
| `public/images/products/laptopkissen-grau.jpg` | Laptop cushion grey | 1500×889 landscape | **1024×1024** |
| `public/images/products/laptopkissen-schwarz.jpg` | Laptop cushion black | 1500×889 landscape | **1024×1024** |
| `public/images/products/brotdose-850ml.jpg` | Lunchbox 850ml | 1500×1481 (approx ok) | 1024×1024 (re-shoot clean) |
| `public/images/products/brotdose-1200ml.jpg` | Lunchbox 1200ml | 1500×1481 | 1024×1024 |
| `public/images/products/brotdose-1400ml.jpg` | Lunchbox 1400ml | 1254×1250 | 1024×1024 |

**Style (har photo me SAME, taaki store uniform lage):**
- Studio product photography, soft diffused lighting, no harsh shadows
- Clean light-grey/off-white seamless background (#F5F5F0)
- Product centered, fills ~70% of frame, slight 3/4 angle (front-top)
- Consistent zoom/scale across all products
- Photorealistic, high detail, no text/watermark

**Prompt template (Midjourney/Flux/DALL·E/Ideogram):**
```
Professional e-commerce product photo of [PRODUCT], [COLOR/MATERIAL],
on a clean light grey seamless studio background (#F5F5F0), soft diffused
lighting, product centered filling 70% of frame, slight three-quarter
angle, photorealistic, 1:1 aspect ratio, high detail, no text, no logo
```

**Saath me ye bhi:** `public/images/products/gallery/brotdose-*.jpg` (16 images) — inhe bhi same style me regenerate karo (product details, open/closed, compartments, size comparisons). Ye product page ki gallery me use hoti hain.

---

## 2. Hero Cutout — ONE PRODUCT, TRANSPARENT PNG

Hero ab **single product** dikhata hai (stack nahi). Abhi snackbox cutout use ho raha hai:
`public/images/products/cutouts/snackbox.png` (679×473 — landscape, low-res).

**Target:** `snackbox.png` → **1400×1400 transparent PNG**
- Product isolated, no background, soft natural shadow below product
- Same product from same angle as the square photo (consistency!)
- High resolution, clean edges (no white fringe)
- Dramatic but soft studio lighting

**Prompt:**
```
Product cutout of a [PRODUCT] on transparent background, isolated with a
soft ground shadow, professional studio product photography, photorealistic,
centered, 1:1, high resolution, clean edges, no background, PNG
```

> Note: laptop-kissen.png aur lunchbox.png cutouts ab hero me use nahi hote
> (sirf fly-to-cart animation me). Inhe bhi transparent PNG hi rakho, square banwao.

---

## 3. Hero Lifestyle Background (Optional — bada visual upgrade)

Abhi `public/images/bg.jpg` ek generic **teal-blue** photo hai jo brand (lime/green) se clash karti hai. Code me deep-green gradient se neutralize kiya hai, lekin **correct asset mile to hero aur premium lagega.**

**Target:** `bg.jpg` → **1920×1080+ (wide), warm eco-feel**
- Deep moody green/foggy forest OR warm minimalist kitchen scene with plants
- Dark enough ki white text readable rahe (ya dim edges)
- Subtle, no busy details center-left (text wahan aata hai)
- No logos, no people faces

**Prompt:**
```
Dark moody eco lifestyle background for a hero section, deep forest green
tones, soft fog, subtle light rays, minimal, dark at the left side for
text overlay, cinematic, photorealistic, 16:9, no people, no text
```

---

## 4. Lifestyle Images — Showcase Sections (3 sections)

Homepage ke 3 product sections me abhi plain product-on-gradient hai. **Product use me dikhane se client ko premium + real feel aati hai.**

| Section | Scene |
|---|---|
| Snackbox | Couch/sofa par snackbox, cozy living room, warm light |
| Laptop cushion | Desk par laptop cushion + laptop, home office, plants |
| Lunchbox (brotdose) | Kitchen me lunchbox, kid's lunch prep, stainless steel close-up |

**Target:** 1200×900 (4:3), square-ish preferred (cards 4:3 use karte hain), photorealistic lifestyle photography, natural light, green plant accents, no text.

---

## 5. Hero Video Loop (Optional — premium "wow")

**Target:** `public/images/hero-loop.mp4` — 6–8 seconds, loopable, ~5MB max
- Product slow 360° rotation OR lifestyle clip (product use me)
- Dark green background to match hero, or transparent/black bg
- 1920×1080, 30fps, H.264

---

## 6. Logo (SVG)

`public/mylogo.png` (1050×535) — nav me use hota hai. Clean **SVG logo** banwao:
- Simple, modern, eco — leaf/green motif + "hausku" wordmark
- Works on white (nav) AND on dark green (footer/hero)
- Transparent background

---

## Order of priority (pehle ye karo)

1. **Square product photos (6)** — #1 fix, sabse zyada impact
2. **Snackbox hero cutout (1400×1400 transparent)** — hero ko complete karta hai
3. **Gallery images** — product page detail
4. **Hero bg.jpg** — premium look
5. **Lifestyle images (3)** — showcase sections
6. Logo SVG, video loop — last (nice-to-have)

---

## How to replace (easy path)

Files ka naam same rakho (e.g., `couchbar-snackbox.jpg` replace karo) —
code me kuch nahi badalna padega, turant live ho jayega.
Bas file ko `public/images/products/` me overwrite karo.
