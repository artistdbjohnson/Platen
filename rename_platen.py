import os
import glob

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    new_content = content.replace('Larkspur', 'Platen')
    new_content = new_content.replace('larkspur', 'platen')
    new_content = new_content.replace('LARKSPUR', 'PLATEN')
    
    if content != new_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated {filepath}')

def main():
    directory = r"C:\Work\Douglxss\Douglxss Projects\Antigravity\Platen"
    
    # Process html and js files
    for ext in ['*.html', 'js/*.js']:
        for filepath in glob.glob(os.path.join(directory, ext)):
            replace_in_file(filepath)
            
    # Rename image assets
    for ext in ['*.png', '*.jpg', '*.svg']:
        for filepath in glob.glob(os.path.join(directory, ext)):
            filename = os.path.basename(filepath)
            if 'larkspur' in filename:
                new_filename = filename.replace('larkspur', 'platen')
                os.rename(filepath, os.path.join(directory, new_filename))
                print(f'Renamed {filename} to {new_filename}')

if __name__ == '__main__':
    main()
