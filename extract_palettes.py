"""Scan ALL gallery pages for color content and extract chromatic palettes."""
from PIL import Image
from collections import Counter
import os

GALLERY = r"C:\Work\Douglxss\Douglxss Projects\Antigravity\Larkspurs\gallery"

def get_chromatic_colors(img_path, n=10, sample_step=3):
    """Get dominant CHROMATIC colors (skip grays)."""
    img = Image.open(img_path).convert("RGB")
    w, h = img.size
    chromatic = []
    for y in range(0, h, sample_step):
        for x in range(0, w, sample_step):
            r, g, b = img.getpixel((x, y))
            r, g, b = (r // 8) * 8, (g // 8) * 8, (b // 8) * 8
            lum = 0.299 * r + 0.587 * g + 0.114 * b
            if lum < 25 or lum > 235:
                continue
            max_c = max(r, g, b)
            min_c = min(r, g, b)
            if max_c == 0:
                continue
            sat = (max_c - min_c) / max_c
            if sat < 0.15:
                continue
            chromatic.append((r, g, b))
    
    if not chromatic:
        return [], 0
    
    counts = Counter(chromatic).most_common(n * 4)
    result = []
    for (r, g, b), count in counts:
        too_close = False
        for pr, pg, pb in result:
            if abs(r - pr) + abs(g - pg) + abs(b - pb) < 70:
                too_close = True
                break
        if not too_close:
            result.append((r, g, b))
        if len(result) >= n:
            break
    return result, len(chromatic)

# Scan ALL pages
all_chromatic = []
pages_with_color = []

for page_num in range(1, 400):  # scan everything
    path = os.path.join(GALLERY, f"page_{page_num}.jpg")
    if not os.path.exists(path):
        continue
    colors, pixel_count = get_chromatic_colors(path, n=8)
    if len(colors) >= 3 and pixel_count > 500:  # meaningful color content
        pages_with_color.append(page_num)
        hex_list = [f"#{r:02x}{g:02x}{b:02x}" for r, g, b in colors]
        print(f"  Page {page_num:3d} [{pixel_count:5d} px]: {hex_list}")
        all_chromatic.extend(colors)

print(f"\n=== {len(pages_with_color)} COLOR PLATES FOUND ===")
print(f"Pages: {pages_with_color}")

# Global palette
global_counts = Counter(all_chromatic).most_common(300)
unique = []
for (r, g, b), count in global_counts:
    too_close = False
    for pr, pg, pb in unique:
        if abs(r - pr) + abs(g - pg) + abs(b - pb) < 55:
            too_close = True
            break
    if not too_close:
        unique.append((r, g, b))
    if len(unique) >= 30:
        break

print(f"\n=== MASTER PALETTE ({len(unique)} colors) ===")
for i, (r, g, b) in enumerate(unique):
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    max_c = max(r, g, b)
    min_c = min(r, g, b)
    sat = (max_c - min_c) / max_c if max_c > 0 else 0
    cat = "DARK" if lum < 80 else ("MID" if lum < 170 else "LIGHT")
    print(f"  {i+1:2d}. #{r:02x}{g:02x}{b:02x}  lum={lum:.0f} sat={sat:.2f} {cat}")
