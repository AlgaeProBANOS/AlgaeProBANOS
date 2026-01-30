#!/usr/bin/env python3
"""
Script to replace image URLs in allSpecies.json with local file paths
Uses the URL to path mapping created by download_images.py
"""

import json
import os
from pathlib import Path

def replace_urls_in_json(
    json_file_path: str,
    mapping_file_path: str,
    output_file_path: str = None,
    in_place: bool = False
):
    """
    Replace image URLs in JSON file with local file paths
    
    Args:
        json_file_path: Path to allSpecies.json file
        mapping_file_path: Path to url_to_path_mapping.json file
        output_file_path: Path to save updated JSON (if None, creates new file)
        in_place: If True, replaces original file (backup created first)
    """
    
    # Load mapping
    print(f"Loading URL to path mapping from: {mapping_file_path}")
    with open(mapping_file_path, 'r', encoding='utf-8') as f:
        url_mapping = json.load(f)
    
    print(f"Loaded {len(url_mapping)} URL mappings")
    
    # Load JSON file
    print(f"\nLoading JSON file: {json_file_path}")
    with open(json_file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Statistics
    total_species = 0
    species_with_images = 0
    total_images = 0
    replaced_images = 0
    unmapped_urls = 0
    unmapped_url_list = []
    
    # Handle both list and dict formats
    if isinstance(data, list):
        species_list = data
    elif isinstance(data, dict):
        species_list = list(data.values())
    else:
        print("Error: JSON format not recognized (expected list or dict)")
        return
    
    # Iterate through species
    for species_item in species_list:
        total_species += 1
        
        # Check if species has images
        if 'images' not in species_item or not species_item['images']:
            continue
        
        species_with_images += 1
        species_name = species_item.get('scientificName', 'Unknown')
        
        # Process each image
        for image_idx, image_data in enumerate(species_item['images']):
            if 'url' not in image_data:
                continue
            
            total_images += 1
            original_url = image_data['url']
            
            # Check if URL is in mapping
            if original_url in url_mapping:
                local_path = url_mapping[original_url]
                
                # Update the URL to local path
                image_data['url'] = local_path
                replaced_images += 1
                
            else:
                unmapped_urls += 1
                if original_url not in unmapped_url_list:
                    unmapped_url_list.append(original_url)
    
    # Save updated JSON
    if in_place:
        # Create backup
        backup_path = Path(json_file_path).with_stem(
            f"{Path(json_file_path).stem}_backup"
        )
        if not backup_path.exists():
            print(f"\nCreating backup: {backup_path}")
            with open(backup_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        output_path = json_file_path
    else:
        if output_file_path:
            output_path = output_file_path
        else:
            output_path = Path(json_file_path).with_stem(
                f"{Path(json_file_path).stem}_with_local_paths"
            )
    
    print(f"\nSaving updated JSON to: {output_path}")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    # Print summary
    print("\n" + "="*70)
    print("URL Replacement Summary:")
    print(f"  Total species processed: {total_species}")
    print(f"  Species with images: {species_with_images}")
    print(f"  Total images found: {total_images}")
    print(f"  URLs successfully replaced: {replaced_images}")
    print(f"  URLs not found in mapping: {unmapped_urls}")
    
    if unmapped_url_list:
        print(f"\n  Unmapped URLs (first 5):")
        for url in unmapped_url_list[:5]:
            print(f"    - {url}")
        if len(unmapped_url_list) > 5:
            print(f"    ... and {len(unmapped_url_list) - 5} more")
    
    print(f"\n  Output file: {Path(output_path).resolve()}")
    
    if in_place and backup_path.exists():
        print(f"  Backup file: {backup_path.resolve()}")
    
    print("="*70)

if __name__ == "__main__":
    # Paths
    json_file = "/Users/jakob.kusnick/Documents/AlgaeProBANOS/public/data/species.json"
    mapping_file = "/Users/jakob.kusnick/Documents/AlgaeProBANOS/downloaded_images/url_to_path_mapping.json"
    
    # Option 1: Save to new file (safer)
    output_file = "/Users/jakob.kusnick/Documents/AlgaeProBANOS/public/data/species_with_local_paths.json"
    replace_urls_in_json(json_file, mapping_file, output_file, in_place=False)
    
    # Option 2: Replace in place (replaces original, creates backup)
    # Uncomment the line below to use this option instead:
    # replace_urls_in_json(json_file, mapping_file, in_place=True)
