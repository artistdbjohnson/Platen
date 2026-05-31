import os
import sys
import json
from PIL import Image
from sklearn.cluster import KMeans
import numpy as np

def rgb_to_hex(rgb):
    return '#{:02x}{:02x}{:02x}'.format(int(rgb[0]), int(rgb[1]), int(rgb[2]))

def get_kmeans_colors(image_path, num_colors=8):
    img = Image.open(image_path)
    img = img.convert('RGB')
    img.thumbnail((300, 300))
    img_array = np.array(img)
    pixels = img_array.reshape(-1, 3)
    
    # Filter out extreme blacks/whites to find the actual dyes
    filtered_pixels = [p for p in pixels if not (p[0]<20 and p[1]<20 and p[2]<20) and not (p[0]>240 and p[1]>240 and p[2]>240)]
    if len(filtered_pixels) < num_colors:
        filtered_pixels = pixels
        
    kmeans = KMeans(n_clusters=num_colors, random_state=42, n_init=10)
    kmeans.fit(filtered_pixels)
    colors = kmeans.cluster_centers_
    
    return [rgb_to_hex(c) for c in colors]

paths = [
    r"C:\Users\0xMwamba\.gemini\antigravity\brain\57ee9372-1099-474e-93ed-349a5eeca95d\media__1771883395732.jpg",
    r"C:\Users\0xMwamba\.gemini\antigravity\brain\57ee9372-1099-474e-93ed-349a5eeca95d\media__1771883395762.jpg"
]

results = {}
for p in paths:
    results[os.path.basename(p)] = get_kmeans_colors(p, 10)

print(json.dumps(results, indent=2))
