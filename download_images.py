#!/usr/bin/env python3
"""
Script to download all images from species.json
Downloads images to a local directory organized by species name
"""

import json
import os
import requests
from pathlib import Path
from urllib.parse import urlparse
import time

def sanitize_filename(filename: str) -> str:
    """Remove or replace invalid filename characters"""
    invalid_chars = ['/', '\\', ':', '*', '?', '"', '<', '>', '|']
    for char in invalid_chars:
        filename = filename.replace(char, '_')
    return filename

def get_filename_from_url(url: str) -> str:
    """Extract filename from URL or generate one"""
    parsed_url = urlparse(url)
    filename = os.path.basename(parsed_url.path)
    if not filename or '.' not in filename:
        # If no extension found, try to infer from URL or use default
        filename = "image.jpg"
    return filename

def download_images(json_file_path: str, output_dir: str = "downloaded_images"):
    """
    Download all images from the species JSON file
    
    Args:
        json_file_path: Path to the species.json file
        output_dir: Directory to save downloaded images (default: downloaded_images)
    """
    
    # Create output directory if it doesn't exist
    output_base = Path(output_dir)
    output_base.mkdir(exist_ok=True)
    
    # Load JSON file
    print(f"Loading JSON file: {json_file_path}")
    with open(json_file_path, 'r', encoding='utf-8') as f:
        species_data = json.load(f)
    
    total_images = 0
    downloaded_images = 0
    failed_images = 0
    
    # Dictionary to map original URLs to downloaded file paths
    url_to_path_mapping = {}
    
    # Iterate through each species
    for species_name, species_info in species_data.items():
        # Check if species has images
        if 'images' not in species_info or not species_info['images']:
            continue
        
        # Create subdirectory for this species
        species_dir = output_base / sanitize_filename(species_name)
        species_dir.mkdir(exist_ok=True)
        
        print(f"\nProcessing: {species_name}")
        
        # Download each image
        for idx, image_data in enumerate(species_info['images']):
            image_url = image_data.get('url')
            if not image_url:
                print(f"  ⚠ Image {idx + 1}: No URL found")
                failed_images += 1
                continue
            
            total_images += 1
            
            try:
                # Get filename
                filename = get_filename_from_url(image_url)
                # Add index to avoid filename conflicts
                name, ext = os.path.splitext(filename)
                filename = f"{name}_{idx}{ext}"
                file_path = species_dir / filename
                
                # Download image
                print(f"  ↓ Downloading: {filename}...", end=" ")
                response = requests.get(image_url, timeout=10)
                response.raise_for_status()
                
                # Save image
                with open(file_path, 'wb') as f:
                    f.write(response.content)
                
                # Add to mapping dictionary
                url_to_path_mapping[image_url] = str(file_path)
                
                print(f"✓ ({len(response.content) / 1024:.1f} KB)")
                downloaded_images += 1
                
                # Be respectful to the server
                time.sleep(0.5)
                
            except requests.exceptions.RequestException as e:
                print(f"✗ Failed: {str(e)}")
                failed_images += 1
            except Exception as e:
                print(f"✗ Error: {str(e)}")
                failed_images += 1
    
    # Save URL to path mapping to JSON file
    mapping_file = output_base / "url_to_path_mapping.json"
    with open(mapping_file, 'w', encoding='utf-8') as f:
        json.dump(url_to_path_mapping, f, indent=2, ensure_ascii=False)
    
    # Print summary
    print("\n" + "="*60)
    print("Download Summary:")
    print(f"  Total images found: {total_images}")
    print(f"  Successfully downloaded: {downloaded_images}")
    print(f"  Failed: {failed_images}")
    print(f"  Output directory: {output_base.resolve()}")
    print(f"  URL mapping saved to: {mapping_file}")
    print("="*60)

if __name__ == "__main__":
    # Path to the species.json file
    json_path = "/Users/jakob.kusnick/Documents/AlgaeProBANOS/public/data/species.json"
    
    # Optional: customize output directory
    output_directory = "/Users/jakob.kusnick/Documents/AlgaeProBANOS/downloaded_images"
    
    # Run the download
    download_images(json_path, output_directory)
