import re
import json
import math
import os

HTML_PATH = "larkspur.html"
MD_PATH = "axidraw_pen_mapping.md"
JSON_OUT = "pen_mapping.json"

# Faber-Castell Pitt Artist Pens (Archival India Ink) - great for Axidraw
FC_PENS = {
    "101 White": "#FFFFFF",
    "103 Ivory": "#FFFFF0",
    "104 Light Yellow Glaze": "#FAFAD2",
    "107 Cadmium Yellow": "#FFD700",
    "109 Dark Chrome Yellow": "#FFC000",
    "113 Orange Glaze": "#FFA500",
    "118 Scarlet Red": "#FF2400",
    "121 Pale Geranium Lake": "#E32636",
    "125 Middle Purple Pink": "#DA70D6",
    "127 Pink Carmine": "#FF69B4",
    "133 Magenta": "#FF00FF",
    "134 Crimson": "#DC143C",
    "136 Purple Violet": "#8A2BE2",
    "143 Cobalt Blue": "#0047AB",
    "146 Sky Blue": "#87CEEB",
    "153 Cobalt Turquoise": "#008B8B",
    "154 Light Cobalt Turquoise": "#AFEEEE",
    "156 Cobalt Green": "#3D9140",
    "157 Dark Indigo": "#311432",
    "161 Phthalo Green": "#123524",
    "167 Permanent Green Olive": "#556B2F",
    "170 May Green": "#4C9141",
    "171 Light Green": "#90EE90",
    "174 Chromium Green Opaque": "#3CB371",
    "175 Dark Sepia": "#302B27",
    "177 Walnut Brown": "#5C4033",
    "180 Raw Umber": "#92705B",
    "186 Terracotta": "#E2725B",
    "188 Sanguine": "#92000A",
    "192 Indian Red": "#CD5C5C",
    "199 Black": "#000000",
    "220 Light Indigo": "#4169E1",
    "232 Cold Grey III": "#A9A9A9",
    "233 Cold Grey IV": "#808080",
    "235 Cold Grey VI": "#696969",
    "247 Indanthrene Blue": "#00205B",
    "268 Green Gold": "#B5A642",
    "272 Warm Grey III": "#D3D3D3",
    "273 Warm Grey IV": "#A9A9A9"
}

# Sakura Pigma Micron
MICRON_PENS = {
    "Micron Black": "#000000",
    "Micron Red": "#FF0000",
    "Micron Blue": "#0000FF",
    "Micron Green": "#008000",
    "Micron Brown": "#8B4513",
    "Micron Purple": "#800080",
    "Micron Orange": "#FFA500",
    "Micron Rose": "#FFC0CB",
    "Micron Sepia": "#704214",
    "Micron Burgundy": "#800020",
    "Micron Hunter Green": "#355E3B",
    "Micron Royal Blue": "#4169E1",
    "Micron Blue/Black": "#00008B",
    "Micron Fresh Green": "#00FF00"
}

ALL_PENS = {**FC_PENS, **MICRON_PENS}

def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))

def color_distance(c1, c2):
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(c1, c2)))

def get_closest_pen(hex_color):
    rgb = hex_to_rgb(hex_color)
    closest = None
    min_dist = float('inf')
    
    for pen_name, pen_hex in ALL_PENS.items():
        pen_rgb = hex_to_rgb(pen_hex)
        dist = color_distance(rgb, pen_rgb)
        if dist < min_dist:
            min_dist = dist
            closest = pen_name
            
    return closest

# 1. Parse all colors from HTML
with open(HTML_PATH, 'r', encoding='utf-8') as f:
    html = f.read()

# Find var PALETTES = { ... }; block
palettes_match = re.search(r'var PALETTES = \{(.*?)\};', html, re.DOTALL)
mapping_dict = {}

if palettes_match:
    palettes_block = palettes_match.group(1)
    # Find all hex colors
    hexes = set(re.findall(r'"#(?:[0-9a-fA-F]{3}){1,2}"', palettes_block))
    hexes = {h.strip('"').upper() for h in hexes}
    
    with open(MD_PATH, 'w', encoding='utf-8') as f:
        f.write("# Axidraw Pen Mapping for Larkspur\n\n")
        f.write("This document maps the digital hex codes used in the Larkspur generative palettes to specific archival physical pens suitable for Axidraw plotting.\n\n")
        f.write("## Recommended Pen Sets\n")
        f.write("- **Faber-Castell Pitt Artist Pens**: Excellent archival India ink, consistent flow, wide color gamut (60+ colors).\n")
        f.write("- **Sakura Pigma Micron**: The industry standard for archival ink, but limited color palette. Very precise nibs.\n\n")
        f.write("## Master Color Mapping List\n\n| Hex Code | Closest Physical Pen |\n|---|---|\n")
        
        for h in sorted(hexes):
            pen = get_closest_pen(h)
            mapping_dict[h] = pen
            f.write(f"| `{h}` | {pen} |\n")
            
with open(JSON_OUT, 'w', encoding='utf-8') as f:
    json.dump(mapping_dict, f, indent=4)

print("Generated MD and JSON mappings.")
