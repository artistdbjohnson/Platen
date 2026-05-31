
import fitz  # PyMuPDF
import os

# Configuration
pdf_path = r"C:\Work\Douglxss\Douglxss Projects\Antigravity\Larkspurs\stitch Patterns.pdf"
output_dir = r"C:\Work\Douglxss\Douglxss Projects\Antigravity\Larkspurs\gallery"

# Create output directory if it doesn't exist
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

def render_pages_to_images(path, out_dir):
    try:
        doc = fitz.open(path)
        print(f"Opened PDF: {path}")
        print(f"Number of pages: {len(doc)}")
        
        # Matrix(2, 2) = 2x zoom = higher resolution (approx 150-200 dpi)
        # Matrix(3, 3) would be even higher if needed
        mat = fitz.Matrix(2, 2)
        
        for i in range(len(doc)):
            page = doc[i]
            
            # Render page to an image (pixmap)
            pix = page.get_pixmap(matrix=mat)
            
            image_filename = f"page_{i+1}.jpg"
            image_filepath = os.path.join(out_dir, image_filename)
            
            pix.save(image_filepath)
            print(f"  Saved: {image_filename}")
            
        print(f"\nDone. Rendered {len(doc)} pages to {out_dir}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    render_pages_to_images(pdf_path, output_dir)
