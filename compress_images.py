#!/usr/bin/env python3
"""
Script to compress and optimize images for web use
Processes all images in the downloaded_images directory
"""

import os
from pathlib import Path
from PIL import Image
import shutil

# Configuration
JPEG_QUALITY = 75  # Quality for JPEG (0-100, 85 is good balance)
PNG_OPTIMIZE = True  # Enable PNG optimization
MAX_WIDTH = 1200  # Maximum width for images (maintains aspect ratio)
MAX_HEIGHT = 1200  # Maximum height for images (maintains aspect ratio)
PROGRESSIVE_JPEG = True  # Use progressive JPEG for faster web loading

def get_image_size_kb(file_path):
    """Get file size in KB"""
    return os.path.getsize(file_path) / 1024

def compress_image(input_path: Path, output_path: Path):
    """
    Compress and optimize an image for web use
    Converts PNG files to JPEG format
    
    Args:
        input_path: Path to original image
        output_path: Path to save compressed image (will be .jpg if input is .png)
    
    Returns:
        Tuple of (original_size_kb, compressed_size_kb, success, output_path)
    """
    try:
        original_size = get_image_size_kb(input_path)
        
        # Convert PNG to JPG in output path
        if input_path.suffix.lower() == '.png':
            output_path = output_path.with_suffix('.jpg')
        
        # Open image
        with Image.open(input_path) as img:
            # Convert to RGB for JPEG (PNG often has transparency)
            if img.mode in ('RGBA', 'LA', 'P'):
                # Create white background
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Resize if image is too large
            if img.width > MAX_WIDTH or img.height > MAX_HEIGHT:
                img.thumbnail((MAX_WIDTH, MAX_HEIGHT), Image.Resampling.LANCZOS)
            
            # Save with optimization based on format
            if output_path.suffix.lower() in ['.jpg', '.jpeg']:
                img.save(
                    output_path,
                    'JPEG',
                    quality=JPEG_QUALITY,
                    optimize=True,
                    progressive=PROGRESSIVE_JPEG
                )
            elif output_path.suffix.lower() == '.png':
                img.save(
                    output_path,
                    'PNG',
                    optimize=PNG_OPTIMIZE
                )
            elif output_path.suffix.lower() == '.webp':
                img.save(
                    output_path,
                    'WEBP',
                    quality=JPEG_QUALITY,
                    method=6  # Slower but better compression
                )
            else:
                # For other formats, just save with optimize flag
                img.save(output_path, optimize=True)
        
        compressed_size = get_image_size_kb(output_path)
        return original_size, compressed_size, True, output_path
        
    except Exception as e:
        print(f"    ✗ Error: {str(e)}")
        return 0, 0, False, output_path

def compress_images_in_directory(input_dir: str, output_dir: str = None, in_place: bool = False):
    """
    Compress all images in a directory
    
    Args:
        input_dir: Directory containing images to compress
        output_dir: Directory to save compressed images (if None, creates 'compressed' folder)
        in_place: If True, replaces original images (backup created first)
    """
    input_path = Path(input_dir)
    
    if not input_path.exists():
        print(f"Error: Input directory '{input_dir}' does not exist!")
        return
    
    # Setup output directory
    if in_place:
        # Create backup
        backup_dir = input_path.parent / f"{input_path.name}_backup"
        if not backup_dir.exists():
            print(f"Creating backup at: {backup_dir}")
            shutil.copytree(input_path, backup_dir)
        output_path = input_path
    else:
        if output_dir:
            output_path = Path(output_dir)
        else:
            output_path = input_path.parent / f"{input_path.name}_compressed"
        output_path.mkdir(exist_ok=True)
    
    # Statistics
    total_images = 0
    processed_images = 0
    failed_images = 0
    total_original_size = 0
    total_compressed_size = 0
    
    # Supported image extensions
    image_extensions = {'.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif'}
    
    print(f"Processing images from: {input_path}")
    print(f"Output directory: {output_path}")
    print(f"Settings: JPEG Quality={JPEG_QUALITY}, Max Size={MAX_WIDTH}x{MAX_HEIGHT}px\n")
    
    # Walk through all subdirectories
    for root, dirs, files in os.walk(input_path):
        root_path = Path(root)
        relative_path = root_path.relative_to(input_path)
        
        # Create corresponding output directory
        if not in_place:
            output_subdir = output_path / relative_path
            output_subdir.mkdir(parents=True, exist_ok=True)
        else:
            output_subdir = root_path
        
        # Process each image file
        image_files = [f for f in files if Path(f).suffix.lower() in image_extensions]
        
        if image_files:
            print(f"\n{relative_path if str(relative_path) != '.' else 'Root'}/ ({len(image_files)} images)")
        
        for filename in image_files:
            total_images += 1
            input_file = root_path / filename
            output_file = output_subdir / filename
            
            # Handle PNG to JPG conversion in display
            display_filename = filename
            if input_file.suffix.lower() == '.png':
                display_filename = f"{filename} (→ JPG)"
            
            print(f"  Processing: {display_filename}...", end=" ")
            
            original_size, compressed_size, success, final_output_path = compress_image(input_file, output_file)
            
            if success:
                processed_images += 1
                total_original_size += original_size
                total_compressed_size += compressed_size
                
                reduction = ((original_size - compressed_size) / original_size * 100) if original_size > 0 else 0
                print(f"✓ {original_size:.1f}KB → {compressed_size:.1f}KB ({reduction:.1f}% reduction)")
            else:
                failed_images += 1
    
    # Print summary
    print("\n" + "="*70)
    print("Compression Summary:")
    print(f"  Total images found: {total_images}")
    print(f"  Successfully processed: {processed_images}")
    print(f"  Failed: {failed_images}")
    print(f"  Total original size: {total_original_size / 1024:.2f} MB")
    print(f"  Total compressed size: {total_compressed_size / 1024:.2f} MB")
    
    if total_original_size > 0:
        overall_reduction = ((total_original_size - total_compressed_size) / total_original_size * 100)
        space_saved = (total_original_size - total_compressed_size) / 1024
        print(f"  Overall size reduction: {overall_reduction:.1f}%")
        print(f"  Space saved: {space_saved:.2f} MB")
    
    if in_place:
        print(f"  Original files backed up to: {backup_dir}")
    else:
        print(f"  Compressed images saved to: {output_path.resolve()}")
    print("="*70)

if __name__ == "__main__":
    # Path to the downloaded images directory
    input_directory = "/Users/jakob.kusnick/Documents/AlgaeProBANOS/downloaded_images"
    
    # Option 1: Compress to a new directory (safer)
    output_directory = "/Users/jakob.kusnick/Documents/AlgaeProBANOS/downloaded_images_compressed"
    compress_images_in_directory(input_directory, output_directory, in_place=False)
    
    # Option 2: Compress in place (replaces originals, but creates backup)
    # Uncomment the line below to use this option instead:
    # compress_images_in_directory(input_directory, in_place=True)
