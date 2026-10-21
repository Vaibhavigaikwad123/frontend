# Product Images Directory

## Overview
This directory contains all product images for the stationery e-commerce store.
All images are referenced in the backend as local paths (e.g., `/assets/products/pencil.jpg`)

## Images Status

### ✅ Available Images (6)
These images are already in place:
1. `hb_pencils_box.jpg` - HB Pencils Box (10 pcs)
2. `dust_free_erasers.jpg` - Dust-Free Erasers (Pack of 5)
3. `classic_notebook_a5.jpg` - Classic A5 Notebook 180 Pages
4. `geometry_box_set.jpg` - Geometry Box Set
5. `roller_pen_blue.jpg` - Liquid Ink Roller Pen (Blue)
6. `fluorescent_highlighters.jpg` - Fluorescent Highlighters (Set of 4)

### ⚠️ Missing Images (11)
You need to add the following images to this directory:

**School Supplies:**
- `whiteboard_markers.jpg` - Whiteboard Marker Set
- `school_backpack.jpg` - Ergonomic Review Backpack
- `scientific_calculator.jpg` - Scientific Calculator

**Art and Craft:**
- `professional_sketchbook.jpg` - Professional Sketchbook A3
- `acrylic_colors_set.jpg` - Acrylic Colors Set (12 Shades)
- `color_pencils_24.jpg` - Artist Color Pencils (24 Pack)
- `colored_craft_papers.jpg` - A4 Colored Craft Papers (50 Sheets)
- `craft_knife.jpg` - Precision Craft Knife/Cutter

**Office Supplies:**
- `expanding_file_folder.jpg` - Expanding File Folder
- `sticky_notes.jpg` - Sticky Notes Memo Pad
- `heavy_duty_stapler.jpg` - Heavy Duty Stapler

## Image Specifications
- **Format:** JPG or PNG
- **Recommended Size:** 800x800 pixels minimum
- **Aspect Ratio:** Square (1:1) preferred
- **Background:** White or transparent
- **File Naming:** Use lowercase with underscores (snake_case)

## Where to Get Images

### Option 1: Free Stock Photo Sites
- **Pexels** (https://www.pexels.com/) - Free, high-quality stock photos
- **Pixabay** (https://pixabay.com/) - Free images and royalty-free stock
- **Unsplash** (https://unsplash.com/) - Beautiful free images

Search for product names and download suitable images. Rename them according to the naming convention above.

### Option 2: Create Your Own
- Take photos of actual products
- Use product images from manufacturer websites (with permission)
- Create custom product mockups using design tools

## Important Notes
- All images are stored locally - NO external URLs
- Backend stores image paths as strings (e.g., `/assets/products/pencil.jpg`)
- Make sure to restart the server after adding new images
- Re-run the seed script (`node seed.js`) after updating images
