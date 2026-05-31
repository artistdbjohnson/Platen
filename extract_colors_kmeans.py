import os
import sys
import json
from PIL import Image
try:
    from sklearn.cluster import KMeans
    import numpy as np
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "scikit-learn", "numpy"])
    from sklearn.cluster import KMeans
    import numpy as np
Agent
Larkspurs
def rgb_to_hex(rgb):
    return '#{:02x}{:02x}{:02x}'.format(int(rgb[0]), int(rgb[1]), int(rgb[2]))

def get_kmeans_colors(image_path, num_colors=4):
    try:
        img = Image.open(image_path)
        img = img.convert('RGB')
        img.thumbnail((150, 150))
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
    except Exception as e:
        return [str(e)]

directory = r"C:\Work\Douglxss\Douglxss Projects\Antigravity\Larkspurs\African Textiles"
results = {}

for filename in os.listdir(directory):
    if filename.endswith(".png") or filename.endswith(".jpg"):
        path = os.path.join(directory, filename)
        colors = get_kmeans_colors(path, 5)
        results[filename] = colors

print(json.dumps(results, indent=2))
