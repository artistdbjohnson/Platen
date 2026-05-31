import os
import sys
from PIL import Image
from collections import Counter
import json

def rgb_to_hex(rgb):
    return '#{:02x}{:02x}{:02x}'.format(rgb[0], rgb[1], rgb[2])

def get_dominant_colors(image_path, num_colors=5):
    try:
        img = Image.open(image_path)
        img = img.convert('RGB')
        img.thumbnail((100, 100)) # Resize for speed
        pixels = list(img.getdata())
        
        # Simple frequency count
        counter = Counter(pixels)
        dominant = counter.most_common(num_colors)
        
        return [rgb_to_hex(color) for color, count in dominant]
    except Exception as e:
        return []

directory = r"C:\Work\Douglxss\Douglxss Projects\Antigravity\Larkspurs\African Textiles"
results = {}

for filename in os.listdir(directory):
    if filename.endswith(".png") or filename.endswith(".jpg"):
        path = os.path.join(directory, filename)
        colors = get_dominant_colors(path, 6)
        results[filename] = colors

print(json.dumps(results, indent=2))
