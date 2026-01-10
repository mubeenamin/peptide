from rembg import remove
from PIL import Image
import io
import os

files = ['molecule-chrome.png', 'molecule-ruby.png', 'molecule-sapphire.png']

for filename in files:
    input_path = os.path.join('public', filename)
    if not os.path.exists(input_path):
        print(f"Skipping {filename}, not found.")
        continue
    
    print(f"Processing {filename} with Rembg...")
    
    with open(input_path, 'rb') as i:
        input_data = i.read()
        output_data = remove(input_data)
        
    with open(input_path, 'wb') as o:
        o.write(output_data)
        
    print(f"Saved {filename}")
