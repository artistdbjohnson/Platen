import math
import re

# Faber-Castell Pitt Artist Pens (India Ink, Archival, 60 Colors)
PITT_PENS = [
    {"name": "White", "code": "101", "hex": "#FFFFFF"},
    {"name": "Cream", "code": "102", "hex": "#FDF2C8"},
    {"name": "Light Yellow Glaze", "code": "104", "hex": "#FBF57E"},
    {"name": "Cadmium Yellow", "code": "107", "hex": "#FFED00"},
    {"name": "Dark Cadmium Yellow", "code": "108", "hex": "#FFCC00"},
    {"name": "Dark Chrome Yellow", "code": "109", "hex": "#FDB913"},
    {"name": "Phthalo Blue", "code": "110", "hex": "#004B87"},
    {"name": "Leaf Green", "code": "112", "hex": "#6EB23B"},
    {"name": "Orange Glaze", "code": "113", "hex": "#F07F23"},
    {"name": "Pale Geranium Lake", "code": "114", "hex": "#E24F44"},
    {"name": "Dark Cadmium Orange", "code": "115", "hex": "#E35A22"},
    {"name": "Scarlet Red", "code": "118", "hex": "#D12D36"},
    {"name": "Ultramarine", "code": "120", "hex": "#304192"},
    {"name": "Pale Carmine", "code": "124", "hex": "#CA3E5F"},
    {"name": "Middle Purple Pink", "code": "125", "hex": "#D85189"},
    {"name": "Permanent Carmine", "code": "126", "hex": "#BB2845"},
    {"name": "Pink Carmine", "code": "127", "hex": "#D23768"},
    {"name": "Light Purple Pink", "code": "128", "hex": "#E67F99"},
    {"name": "Pink Madder Lake", "code": "129", "hex": "#CA567B"},
    {"name": "Medium Flesh", "code": "131", "hex": "#E9A28E"},
    {"name": "Light Flesh", "code": "132", "hex": "#F4BCA3"},
    {"name": "Magenta", "code": "133", "hex": "#A83669"},
    {"name": "Crimson", "code": "134", "hex": "#A2284C"},
    {"name": "Purple Violet", "code": "136", "hex": "#623162"},
    {"name": "Sky Blue", "code": "146", "hex": "#64A6D5"},
    {"name": "Warm Grey V", "code": "274", "hex": "#504E4A"},
    {"name": "Warm Grey IV", "code": "273", "hex": "#6C6B64"},
    {"name": "Warm Grey III", "code": "272", "hex": "#89887F"},
    {"name": "Cold Grey I", "code": "230", "hex": "#D9DBDA"},
    {"name": "Cold Grey III", "code": "232", "hex": "#99A0A6"},
    {"name": "Cold Grey IV", "code": "233", "hex": "#767A7D"},
    {"name": "Cold Grey VI", "code": "235", "hex": "#4C4F51"},
    {"name": "Black", "code": "199", "hex": "#000000"},
    {"name": "Nougat", "code": "278", "hex": "#584435"},
    {"name": "Dark Sepia", "code": "175", "hex": "#3A332B"},
    {"name": "Sanguine", "code": "188", "hex": "#983626"},
    {"name": "Terracotta", "code": "186", "hex": "#BB5835"},
    {"name": "Cinnamon", "code": "189", "hex": "#CF8460"},
    {"name": "Green Gold", "code": "268", "hex": "#9BA829"},
    {"name": "May Green", "code": "170", "hex": "#9CC347"},
    {"name": "Earth Green", "code": "172", "hex": "#597E52"},
    {"name": "Olive Green Yellowish", "code": "173", "hex": "#7A823B"},
    {"name": "Chromium Green Opaque", "code": "174", "hex": "#4A6E4F"},
    {"name": "Dark Phthalo Green", "code": "264", "hex": "#005540"},
    {"name": "Deep Scarlet Red", "code": "219", "hex": "#BF1931"},
    {"name": "Dark Red", "code": "225", "hex": "#881E31"},
    {"name": "Alizarin Crimson", "code": "226", "hex": "#A11438"},
    {"name": "Dark Indigo", "code": "157", "hex": "#193551"},
    {"name": "Dark Naples Ochre", "code": "184", "hex": "#EABC52"},
    {"name": "Raw Umber", "code": "180", "hex": "#86603D"},
    {"name": "Burnt Sienna", "code": "283", "hex": "#A04A2F"},
    {"name": "Light Phthalo Green", "code": "162", "hex": "#27A472"},
    {"name": "Cobalt Green", "code": "156", "hex": "#008688"},
    {"name": "Cobalt Turquoise", "code": "153", "hex": "#0083A8"},
    {"name": "Light Indigo", "code": "145", "hex": "#5D6782"}
]

def hex_to_rgb(hex_code):
    hex_code = hex_code.lstrip('#')
    return tuple(int(hex_code[i:i+2], 16) for i in (0, 2, 4))

def color_distance(rgb1, rgb2):
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(rgb1, rgb2)))

def get_closest_pen(target_hex):
    target_rgb = hex_to_rgb(target_hex)
    closest_pen = None
    min_dist = float('inf')
    
    for pen in PITT_PENS:
        pen_rgb = hex_to_rgb(pen["hex"])
        dist = color_distance(target_rgb, pen_rgb)
        if dist < min_dist:
            min_dist = dist
            closest_pen = pen
            
    return closest_pen

def process_palettes(html_file):
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    palettes_text = re.search(r'var PALETTES = (\{.*?\});', content, re.DOTALL).group(1)
    
    palettes = {}
    current_palette = None
    lines = palettes_text.split('\n')
    for line in lines:
        m_start = re.search(r'([a-z]+):\s*\[', line)
        if m_start:
            current_palette = m_start.group(1)
            palettes[current_palette] = []
        elif current_palette:
            m_color = re.search(r'{[^}]*c:\s*"([^"]+)"', line)
            if m_color:
                palettes[current_palette].append(m_color.group(1))

    mapped_palettes = {}
    for name, hexes in palettes.items():
        mapped_palettes[name] = []
        for h in hexes:
            pen = get_closest_pen(h)
            mapped_palettes[name].append({
                "original_hex": h,
                "pen_name": pen["name"],
                "pen_code": pen["code"],
                "pen_hex": pen["hex"]
            })
            
    return mapped_palettes

if __name__ == "__main__":
    mapped = process_palettes("larkspur-quine.html")
    
    md_content = "# Axidraw Pen Mappings\n\n"
    md_content += "This document provides a mapping of all generative palette colors to **Faber-Castell Pitt Artist Pens**.\n"
    md_content += "Faber-Castell Pitt Artist Pens use high-quality, archival India Ink, which is perfect for plotter art.\n\n"
    
    md_content += "## Complete Pen List (Palette Subset)\n"
    seen_pens = set()
    for pal in mapped.values():
        for color in pal:
            seen_pens.add(f"- {color['pen_code']} - {color['pen_name']}")
    md_content += "\n".join(sorted(seen_pens)) + "\n\n"
    
    md_content += "## Palettes\n\n"
    for pal_name, colors in mapped.items():
        md_content += f"### {pal_name.capitalize()}\n"
        for c in colors:
            md_content += f"- Original `{c['original_hex']}` ➔ **{c['pen_name']}** ({c['pen_code']})\n"
        md_content += "\n"
        
    with open("library/axidraw-pens.md", "w") as f:
        f.write(md_content)
        
    js_dict = "var AXIDRAW_PENS = {\n"
    for pal_name, colors in mapped.items():
        js_dict += f"    {pal_name}: [\n"
        for c in colors:
            js_dict += f"        {{ orig: \"{c['original_hex']}\", pen: \"{c['pen_name']} (Pitt {c['pen_code']})\", hex: \"{c['pen_hex']}\" }},\n"
        js_dict += "    ],\n"
    js_dict += "};"
    
    with open("js.txt", "w") as f:
        f.write(js_dict)
    
    print("Done generating pens.")
