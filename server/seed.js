require('dotenv').config()
const mongoose = require('mongoose')
const Product = require('./src/models/Product')

const products = [

  /* ======================
     PENCILS
  ====================== */
  {
    name: 'HB Pencils Box (10 pcs)',
    description: 'Smooth and dark writing pencils.',
    price: 50,
    category: 'School Supplies',
    subcategory: 'Stationery Basics',
    brand: 'Staedtler',
    stock: 120,
    images: ['/assets/PencilBrand/Staedtler.jpg'],
  },

  {
    name: 'Student Writing Pencils',
    description: 'Affordable pencils for school students.',
    price: 45,
    category: 'School Supplies',
    subcategory: 'Stationery Basics',
    brand: 'Apsara',
    stock: 150,
    images: ['/assets/PencilBrand/Apsara.jpeg'],
  },

  {
    name: 'Classic HB Pencils',
    description: 'Reliable pencils for exams and daily writing.',
    price: 40,
    category: 'School Supplies',
    subcategory: 'Stationery Basics',
    brand: 'Nataraj',
    stock: 200,
    images: ['/assets/PencilBrand/Natraj.jpg'],
  },

  {
    name: 'Artist Sketch Pencils',
    description: 'Professional quality sketch pencils.',
    price: 90,
    category: 'School Supplies',
    subcategory: 'Stationery Basics',
    brand: 'Faber-Castell',
    stock: 80,
    images: ['/assets/PencilBrand/Faber-Castell.jpg'],
    featured: true
  },
  {
    name: 'Graphite Pencils Set',
    description: 'Smooth graphite pencils for exams and writing.',
    price: 55,
    category: 'School Supplies',
    subcategory: 'Stationery Basics',
    brand: 'Camlin',
    stock: 100,
    images: ['/assets/PencilBrand/Camlin.jpeg']
  },
  {
    name: 'Student Writing Pencils',
    description: 'Affordable pencils for students.',
    price: 40,
    category: 'School Supplies',
    subcategory: 'Stationery Basics',
    brand: 'Doms',
    stock: 200,
    images: ['/assets/PencilBrand/Doms.jpeg']
  },

  {
    name: 'Premium Writing Pencils',
    description: 'Smooth pencils with consistent graphite',
    price: 65,
    category: 'School Supplies',
    subcategory: 'Stationery Basics',
    brand: 'Uni Ball',
    stock: 200,
    images: ['/assets/PencilBrand/Uni Ball.jpg']
  },

  {
    name: 'School Grade Pencils',
    description: 'Reliable pencils for students and exams.',
    price: 40,
    category: 'School Supplies',
    subcategory: 'Stationery Basics',
    brand: 'Scholar',
    stock: 200,
    images: ['/assets/PencilBrand/Scholar.jpg']
  },




  /* ======================
     SHARPENERS
  ====================== */
  {
    name: 'Classic Pencil Sharpener',
    description: 'Durable sharpener for smooth sharpening.',
    price: 10,
    category: 'School Supplies',
    subcategory: 'Pencil Sharpener',
    brand: 'Apsara',
    stock: 120,
    images: ['/assets/SharpenerBrand/Apsara.jpg'],
  },

  {
    name: 'Double Hole Sharpener',
    description: 'Sharpener suitable for jumbo pencils.',
    price: 25,
    category: 'School Supplies',
    subcategory: 'Pencil Sharpener',
    brand: 'Keyroad',
    stock: 80,
    images: ['/assets/SharpenerBrand/Keyroad.jpg'],
  },

  {
    name: 'Metal Pencil Sharpener',
    description: 'High quality metal sharpener for long-lasting use',
    price: 25,
    category: 'School Supplies',
    subcategory: 'Pencil Sharpener',
    brand: 'Nataraj',
    stock: 80,
    images: ['/assets/SharpenerBrand/Nataraj.jpg'],
  },




  /* ======================
     ERASERS
  ====================== */
  {
    name: 'Dust Free Eraser',
    description: 'Soft eraser with no dust.',
    price: 10,
    category: 'School Supplies',
    subcategory: 'Eraser',
    brand: 'Apsara',
    stock: 200,
    images: ['/assets/EraserBrand/Apsara.png'],
  },

  {
    name: 'Premium Eraser',
    description: 'High quality long lasting eraser.',
    price: 20,
    category: 'School Supplies',
    subcategory: 'Eraser',
    brand: 'Keyroad',
    stock: 120,
    images: ['/assets/EraserBrand/Keyroad.jpg'],
  },

  {
    name: 'Non Dust Eraser',
    description: 'Clean erasing without paper damage.',
    price: 20,
    category: 'School Supplies',
    subcategory: 'Eraser',
    brand: 'Nataraj',
    stock: 120,
    images: ['/assets/EraserBrand/Nataraj.jpg'],
  },



  /* ======================
     MECHANICAL PENCILS
  ====================== */
  {
    name: 'Kaco Mechanical Pencil 0.5mm',
    description: 'Smooth writing mechanical pencil.',
    price: 120,
    category: 'School Supplies',
    subcategory: 'Mechanical Pencil',
    brand: 'Kaco',
    stock: 80,
    images: ['/assets/MechanicalPencilBrand/Kaco.webp'],
  },

  {
    name: 'Uni Ball Mechanical Pencil',
    description: 'Durable premium mechanical pencil.',
    price: 170,
    category: 'School Supplies',
    subcategory: 'Mechanical Pencil',
    brand: 'Uni Ball',
    stock: 90,
    images: ['/assets/MechanicalPencilBrand/UniBall.webp'],
  },

  {
    name: 'Sakura Mechanical Penci',
    description: 'Japanese precision pencil',
    price: 170,
    category: 'School Supplies',
    subcategory: 'Mechanical Pencil',
    brand: 'Sakura',
    stock: 90,
    images: ['/assets/MechanicalPencilBrand/Sakura.webp'],
  },



  /* ======================
     NOTEBOOKS
  ====================== */
  {
    name: 'Classmate Notebook',
    description: 'High quality ruled notebook.',
    price: 120,
    category: 'School Supplies',
    subcategory: 'Notebook',
    brand: 'Classmate',
    stock: 150,
    images: ['/assets/NotebookBrand/Classmate.avif'],
  },

  {
    name: 'Doms Notebook',
    description: 'Durable notebook for daily school use.',
    price: 95,
    category: 'School Supplies',
    subcategory: 'Notebook',
    brand: 'Doms',
    stock: 180,
    images: ['/assets/NotebookBrand/Doms.webp'],
  },

  /* ======================
     GLUE
  ====================== */
  {
    name: 'Fevicol MR Glue',
    description: 'Strong adhesive glue for school & office.',
    price: 45,
    category: 'School Supplies',
    subcategory: 'Glue',
    brand: 'Pidilite',
    stock: 200,
    images: ['/assets/GlueBrand/Pidilite.jpg'],
  },

  {
    name: 'Faber-Castell Craft Glue',
    description: 'Premium glue for art and craft.',
    price: 65,
    category: 'School Supplies',
    subcategory: 'Glue',
    brand: 'Faber-Castell',
    stock: 120,
    images: ['/assets/GlueBrand/Faber-Castell.jpg'],
  },

  /* ======================
     PENS
  ====================== */
  {
    name: 'Cello Butterflow Pen',
    description: 'Smooth writing ball pen.',
    price: 30,
    category: 'School Supplies',
    subcategory: 'Pens',
    brand: 'Cello',
    stock: 200,
    images: ['/assets/PenBrand/Cello-Butterflow.jpg'],
  },

  {
    name: 'Uni Ball Pen',
    description: 'Premium smooth ink pen.',
    price: 60,
    category: 'School Supplies',
    subcategory: 'Pens',
    brand: 'Uni Ball',
    stock: 120,
    images: ['/assets/PenBrand/UniBall.jpg'],
  },

  {
    name: 'Cello Gripper Pen',
    description: 'Comfort grip pen for long writing',
    price: 25,
    category: 'School Supplies',
    subcategory: 'Pens',
    brand: 'Cello',
    stock: 180,
    images: ['/assets/PenBrand/Cello.jpg']
  },

  {
    name: 'Octane',
    description: 'Comfort gel pen for long writing',
    price: 25,
    category: 'School Supplies',
    subcategory: 'Pens',
    stock: 180,
    images: ['/assets/PenBrand/octane.webp']
  },




  /* ======================
     HIGHLIGHTERS
  ====================== */
  {
    name: 'Faber-Castell Highlighter',
    description: 'Bright ink highlighter.',
    price: 55,
    category: 'School Supplies',
    subcategory: 'Highlighter',
    brand: 'Faber-Castell',
    stock: 120,
    images: ['/assets/HighlighterBrand/faber-castell.jpg'],
  },

  {
    name: 'Stabilo Boss Highlighter',
    description: 'Premium fluorescent highlighter.',
    price: 75,
    category: 'School Supplies',
    subcategory: 'Highlighter',
    brand: 'Stabilo',
    stock: 90,
    images: ['/assets/HighlighterBrand/Stablio.jpg'],
  },

  {
    name: 'Staedtler Marker',
    description: 'Premium quality highlighter',
    price: 65,
    category: 'School Supplies',
    subcategory: 'Highlighter',
    brand: 'Staedtler',
    stock: 100,
    images: ['/assets/HighlighterBrand/Staedtler.jpg']
  },



  /* ======================
     MARKERS (NO BRAND FILTER)
  ====================== */
  {
    name: 'Luxor Marker',
    description: 'Permanent marker for office and school.',
    price: 45,
    category: 'School Supplies',
    subcategory: 'Marker',
    brand: 'Luxor',
    stock: 150,
    images: ['/assets/Marker/Luxor-Marker.webp'],
  },
  {
    name: 'Morris Marker',
    description: 'Smooth ink marker for daily use',
    price: 40,
    category: 'School Supplies',
    subcategory: 'Marker',
    brand: 'Morris',
    stock: 120,
    images: ['/assets/Marker/Morris.webp']
  },
  {
    name: 'Staedtler Marker',
    description: 'Premium quality marker pen',
    price: 65,
    category: 'School Supplies',
    subcategory: 'Marker',
    brand: 'Staedtler',
    stock: 100,
    images: ['/assets/Marker/Staedtler.jpg']
  },

  {
    name: 'White Board Marker',
    description: 'Easy erase whiteboard marker.',
    price: 55,
    category: 'School Supplies',
    subcategory: 'Marker',
    brand: 'Luxor',
    stock: 180,
    images: ['/assets/Marker/WhiteBoard-Marker.webp'],
  },

  // ===== COLOR PENCIL (ART & CRAFT) =====
  {
    name: 'Faber-Castell Colour Pencils',
    description: 'Premium color pencils for art and sketching',
    price: 180,
    category: 'Art And Craft',
    subcategory: 'Color Pencil',
    brand: 'Faber-Castell',
    stock: 100,
    images: ['/assets/ColourPencil/Faber-castell.webp'],
    featured: true
  },
  {
    name: 'Doms Colour Pencil Set',
    description: 'Smooth color pencils for kids and beginners',
    price: 120,
    category: 'Art And Craft',
    subcategory: 'Color Pencil',
    brand: 'Doms',
    stock: 150,
    images: ['/assets/ColourPencil/Doms.webp']
  },
  {
    name: 'Derwent Colour Pencils',
    description: 'Professional artist grade color pencils',
    price: 450,
    category: 'Art And Craft',
    subcategory: 'Color Pencil',
    brand: 'Derwent',
    stock: 60,
    images: ['/assets/ColourPencil/Derwant.jpg']
  },
  {
    name: 'Koh-i-Noor Colour Pencils',
    description: 'European quality color pencils',
    price: 300,
    category: 'Art And Craft',
    subcategory: 'Color Pencil',
    brand: 'Koh-i-Noor',
    stock: 70,
    images: ['/assets/ColourPencil/Koh-i-noor.jpg']
  },
  {
    name: 'Conte a Paris Colour Pencil Set',
    description: 'Fine art color pencils set',
    price: 520,
    category: 'Art And Craft',
    subcategory: 'Color Pencil',
    brand: 'Conte a Paris',
    stock: 40,
    images: ['/assets/ColourPencil/conte-a-paris-sets.jpg']
  },

  {
    name: 'Conte a Paris Red Brown Colour Pencil',
    description: 'Professional red brown color pencil for artists',
    price: 95,
    category: 'Art And Craft',
    subcategory: 'Color Pencil',
    brand: 'Conte a Paris',
    stock: 60,
    images: ['/assets/ColourPencil/Conteaparis-redbown.webp']
  },
  {
    name: 'Conte a Paris White Colour Pencil',
    description: 'High quality white color pencil for highlights',
    price: 90,
    category: 'Art And Craft',
    subcategory: 'Color Pencil',
    brand: 'Conte a Paris',
    stock: 70,
    images: ['/assets/ColourPencil/conte-a-paris-white.webp']
  },






  /* ======================
     SKETCH PENS (ART & CRAFT)
  ====================== */

  {
    name: 'Camlin Sketch Pens',
    description: 'Bright sketch pens for kids and art projects',
    price: 120,
    category: 'Art And Craft',
    subcategory: 'Sketch Pen',
    brand: 'Camlin',
    stock: 100,
    images: ['/assets/SketchPen/Camlin.jpg'], // ✅ FIXED
  },

  {
    name: 'Doms Sketch Pens',
    description: 'Smooth ink sketch pens for colouring',
    price: 110,
    category: 'Art And Craft',
    subcategory: 'Sketch Pen',
    brand: 'Doms',
    stock: 120,
    images: ['/assets/SketchPen/Doms.webp'],
  },

  {
    name: 'Doms Sketch Pens (24 Shades)',
    description: '24 shade sketch pen set for drawing',
    price: 180,
    category: 'Art And Craft',
    subcategory: 'Sketch Pen',
    brand: 'Doms',
    stock: 80,
    images: ['/assets/SketchPen/Doms-24shade.webp'],
  },

  {
    name: 'Faber-Castell Sketch Pens',
    description: 'Premium sketch pens for art & craft',
    price: 220,
    category: 'Art And Craft',
    subcategory: 'Sketch Pen',
    brand: 'Faber-Castell',
    stock: 70,
    images: ['/assets/SketchPen/Faber-Castell.jpg'],
  },

  {
    name: 'Zunbella Sketch Pens',
    description: 'Vibrant colour sketch pens',
    price: 95,
    category: 'Art And Craft',
    subcategory: 'Sketch Pen',
    brand: 'Zunbella',
    stock: 150,
    images: ['/assets/SketchPen/Zunbella.jpg'],
  },

  /* ======================
     ACRYLIC COLORS (ART & CRAFT)
  ====================== */

  {
    name: 'Brustro Acrylic Colours Set',
    description: 'Premium acrylic colours for professional artists',
    price: 550,
    category: 'Art And Craft',
    subcategory: 'Acrylic Color',
    brand: 'Brustro',
    stock: 60,
    images: ['/assets/AcrylicColor/Brustro.webp'],
    featured: true
  },

  {
    name: 'Camel Acrylic Colours',
    description: 'High quality acrylic colours for beginners and students',
    price: 320,
    category: 'Art And Craft',
    subcategory: 'Acrylic Color',
    brand: 'Camel',
    stock: 120,
    images: ['/assets/AcrylicColor/Camel.webp'],
  },

  {
    name: 'Camel Acrylic Colours (12 Shades)',
    description: '12 shade acrylic colour set for art & craft',
    price: 420,
    category: 'Art And Craft',
    subcategory: 'Acrylic Color',
    brand: 'Camel',
    stock: 90,
    images: ['/assets/AcrylicColor/Camel-12shades.webp'],
  },

  {
    name: 'Faber-Castell Acrylic Colours',
    description: 'Smooth texture acrylic colours with rich pigments',
    price: 480,
    category: 'Art And Craft',
    subcategory: 'Acrylic Color',
    brand: 'Faber-Castell',
    stock: 70,
    images: ['/assets/AcrylicColor/Faber-Castell.jpg'],
  },

  {
    name: 'Liquitex Acrylic Colours',
    description: 'Professional grade acrylic colours for artists',
    price: 850,
    category: 'Art And Craft',
    subcategory: 'Acrylic Color',
    brand: 'Liquitex',
    stock: 40,
    images: ['/assets/AcrylicColor/Liquitex.jpg'],
  },

  {
    name: 'Mont Marte Acrylic Colours',
    description: 'Vibrant acrylic colours for canvas painting',
    price: 600,
    category: 'Art And Craft',
    subcategory: 'Acrylic Color',
    brand: 'Mont Marte',
    stock: 65,
    images: ['/assets/AcrylicColor/MontMarte.webp'],
  },

  /* ======================
     WATER COLORS (ART & CRAFT)
  ====================== */

  {
    name: 'Brustro Water Colours',
    description: 'Professional water colours for artists',
    price: 450,
    category: 'Art And Craft',
    subcategory: 'Water Color',
    brand: 'Brustro',
    stock: 60,
    images: ['/assets/WaterColor/Brusto.jpg'],
  },

  {
    name: 'Camlin Water Colours',
    description: 'Student grade water colours',
    price: 180,
    category: 'Art And Craft',
    subcategory: 'Water Color',
    brand: 'Camlin',
    stock: 120,
    images: ['/assets/WaterColor/Camlin.jpg'],
  },

  {
    name: 'Camlin Water Colour Tubes',
    description: 'Water colour tubes for painting',
    price: 320,
    category: 'Art And Craft',
    subcategory: 'Water Color',
    brand: 'Camlin',
    stock: 90,
    images: ['/assets/WaterColor/CamlinWaterColourTubes.jpg'],
  },

  {
    name: 'Derwent Water Colours',
    description: 'Premium artist water colours',
    price: 520,
    category: 'Art And Craft',
    subcategory: 'Water Color',
    brand: 'Derwent',
    stock: 50,
    images: ['/assets/WaterColor/Derwant.jpg'],
  },

  {
    name: 'Faber-Castell Water Colours',
    description: 'High quality water colour set',
    price: 380,
    category: 'Art And Craft',
    subcategory: 'Water Color',
    brand: 'Faber-Castell',
    stock: 80,
    images: ['/assets/WaterColor/Faber-Castell.jpg'],
  },

  {
    name: 'Mont Marte Water Colours',
    description: 'Professional painting water colours',
    price: 600,
    category: 'Art And Craft',
    subcategory: 'Water Color',
    brand: 'Mont Marte',
    stock: 40,
    images: ['/assets/WaterColor/MontMarte.jpg'],
  },

  {
    name: 'Sakura Water Colours',
    description: 'Japanese premium water colours',
    price: 550,
    category: 'Art And Craft',
    subcategory: 'Water Color',
    brand: 'Sakura',
    stock: 45,
    images: ['/assets/WaterColor/Sakura.jpg'],
  },

  /* ======================
     PASTEL COLORS (ART & CRAFT)
  ====================== */

  {
    name: 'Brustro Soft Pastels',
    description: 'Professional soft pastels for artists',
    price: 480,
    category: 'Art And Craft',
    subcategory: 'Pastel Color',
    brand: 'Brustro',
    stock: 60,
    images: ['/assets/PastelColor/Brustro.jpg'],
  },

  {
    name: 'Camlin Soft Pastels',
    description: 'Student grade soft pastels',
    price: 190,
    category: 'Art And Craft',
    subcategory: 'Pastel Color',
    brand: 'Camlin',
    stock: 130,
    images: ['/assets/PastelColor/Camlin.jpeg'],
  },

  {
    name: 'Camlin Soft Pastel Set',
    description: 'Smooth pastel sticks for drawing',
    price: 260,
    category: 'Art And Craft',
    subcategory: 'Pastel Color',
    brand: 'Camlin',
    stock: 90,
    images: ['/assets/PastelColor/CamlinSoftPastel.jpeg'],
  },

  {
    name: 'Faber-Castell Soft Pastels',
    description: 'Premium soft pastel colours',
    price: 420,
    category: 'Art And Craft',
    subcategory: 'Pastel Color',
    brand: 'Faber-Castell',
    stock: 70,
    images: ['/assets/PastelColor/FaberCastell.webp'],
  },

  /* ======================
     WATER COLOR BRUSH (ART & CRAFT)
  ====================== */

  {
    name: 'Brustro Water Color Brush Set',
    description: 'Professional watercolor brushes for artists',
    price: 520,
    category: 'Art And Craft',
    subcategory: 'Water Color Brush',
    brand: 'Brustro',
    stock: 70,
    images: ['/assets/WaterColorBrush/Brustro.webp'],
  },

  {
    name: 'Camlin Water Color Brush',
    description: 'Student grade watercolor brushes',
    price: 180,
    category: 'Art And Craft',
    subcategory: 'Water Color Brush',
    brand: 'Camlin',
    stock: 150,
    images: ['/assets/WaterColorBrush/Camlin.jpg'],
  },

  {
    name: 'Faber-Castell Water Color Brush',
    description: 'Premium brush set for watercolor painting',
    price: 480,
    category: 'Art And Craft',
    subcategory: 'Water Color Brush',
    brand: 'Faber-Castell',
    stock: 80,
    images: ['/assets/WaterColorBrush/FaberCastell.jpg'],
  },

  {
    name: 'Liquitex Water Color Brush',
    description: 'High quality brushes for professionals',
    price: 620,
    category: 'Art And Craft',
    subcategory: 'Water Color Brush',
    brand: 'Liquitex',
    stock: 60,
    images: ['/assets/WaterColorBrush/Liquitex.webp'],
  },

  {
    name: 'Mont Marte Water Color Brush',
    description: 'Affordable brush set for beginners',
    price: 260,
    category: 'Art And Craft',
    subcategory: 'Water Color Brush',
    brand: 'Mont Marte',
    stock: 120,
    images: ['/assets/WaterColorBrush/MontMarte.jpg'],
  },

  /* ======================
     Paltte (ART & CRAFT)
  ====================== */
  {
    name: 'Khayati Paltte',
    description: 'Affordable Palette for beginners',
    price: 260,
    category: 'Art And Craft',
    subcategory: 'Palette',
    brand: 'Khyati',
    stock: 120,
    images: ['/assets/Palette/Khyati.webp'],
  },

  {
    name: 'Khayati OvalBig Paltte',
    description: 'Affordable Palette for beginners',
    price: 260,
    category: 'Art And Craft',
    subcategory: 'Palette',
    brand: 'Khyati',
    stock: 120,
    images: ['/assets/Palette/OvalBig.jpg'],
  },


  /* ======================
     Stapler(OFFICE SUPPLIES)
  ====================== */
  {
    name: 'Kangaro',
    description: 'Durable stapler for daily office and school use',
    price: 45,
    category: 'Office Supplies',
    subcategory: 'Stapler',
    brand: 'Kangaro',
    stock: 200,
    images: ['/assets/Stapler/Kangaro.webp'],
  },
  {
    name: 'Kangaro HP-45 Stapler',
    description: 'Heavy duty stapler suitable for thick papers',
    price: 45,
    category: 'Office Supplies',
    subcategory: 'Stapler',
    brand: 'Kangaro',
    stock: 200,
    images: ['/assets/Stapler/KangaroHP-45.jpg'],
  },
  {
    name: 'Kangaro Punch ',
    description: 'punch machine for office work',
    price: 45,
    category: 'Office Supplies',
    subcategory: 'Stapler',
    brand: 'Kangaro',
    stock: 200,
    images: ['/assets/Stapler/KangaroPunch.webp'],
  },

  /* ======================
     Scissors(OFFICE SUPPLIES)
  ====================== */
  {
    name: 'Maped Scissor',
    description: 'Strong Scissor for office and school use',
    price: 45,
    category: 'Office Supplies',
    subcategory: 'Scissors',
    brand: 'Maped',
    stock: 200,
    images: ['/assets/Scissors/Maped.jpg'],
  },

  /* ======================
     PINS & CLIPS (OFFICE SUPPLIES)
  ====================== */

  {
    name: 'Omega Paper Pins',
    description: 'Strong paper pins for office and school use',
    price: 45,
    category: 'Office Supplies',
    subcategory: 'Pins And Clips',
    brand: 'Omega',
    stock: 200,
    images: ['/assets/PinsAndClips/Omega.jpg'],
  },

  {
    name: 'Omega Steel Pins',
    description: 'Durable steel pins for notice boards',
    price: 60,
    category: 'Office Supplies',
    subcategory: 'Pins And Clips',
    brand: 'Omega',
    stock: 150,
    images: ['/assets/PinsAndClips/OmegaPin.webp'],
  },

  {
    name: 'Worldone Paper Clips',
    description: 'High quality paper clips for documents',
    price: 55,
    category: 'Office Supplies',
    subcategory: 'Pins And Clips',
    brand: 'Worldone',
    stock: 180,
    images: ['/assets/PinsAndClips/Worldone.webp'],
  },

  {
    name: 'Khayati Pen Stand',
    description: 'Premium plastic pen stand for office desks',
    price: 150,
    category: 'Office Supplies',
    subcategory: 'Pen Stand',
    brand: 'Khayati',
    stock: 80,
    images: ['/assets/PenStand/Khayati.webp'],
  },

  {
    name: 'Khayati Elite Pen Stand',
    description: 'Elegant pen stand for professional use',
    price: 220,
    category: 'Office Supplies',
    subcategory: 'Pen Stand',
    brand: 'Khayati',
    stock: 60,
    images: ['/assets/PenStand/KhaytiElite.webp'],
  },

  {
    name: 'Casio Calculator',
    description: 'Basic calculator for students and office',
    price: 350,
    category: 'Office Supplies',
    subcategory: 'Calculator',
    brand: 'Casio',
    stock: 100,
    images: ['/assets/Calculator/Casio.avif'],
  },

  {
    name: 'Casio Scientific Calculator',
    description: 'Scientific calculator for advanced calculations',
    price: 750,
    category: 'Office Supplies',
    subcategory: 'Calculator',
    brand: 'Casio',
    stock: 50,
    images: ['/assets/Calculator/CasioCalculator.avif'],
  },
  {
    name: 'Transparent Plastic File',
    description: 'Transparent plastic document file',
    price: 40,
    category: 'Office Supplies',
    subcategory: 'Plastic File',
    brand: 'Worldone',
    stock: 200,
    images: ['/assets/PlasticFile/SleeveTransparent.jpg'],
  },

  {
    name: 'Worldone Plastic File',
    description: 'Durable plastic file for office documents',
    price: 65,
    category: 'Office Supplies',
    subcategory: 'Plastic File',
    brand: 'Worldone',
    stock: 150,
    images: ['/assets/PlasticFile/Worldone.webp'],
  },

  {
    name: 'Worldone 2D Plastic File',
    description: 'Stylish 2D design plastic file',
    price: 80,
    category: 'Office Supplies',
    subcategory: 'Plastic File',
    brand: 'Worldone',
    stock: 120,
    images: ['/assets/PlasticFile/Worldone2D.webp'],
  },
  {
    name: 'Leather File Folder',
    description: 'Premium leather document file',
    price: 450,
    category: 'Office Supplies',
    subcategory: 'Leather File',
    brand: 'Generic',
    stock: 40,
    images: ['/assets/Leather/Leather.webp'],
  },

  {
    name: 'Leather Office File',
    description: 'Professional leather file for office use',
    price: 520,
    category: 'Office Supplies',
    subcategory: 'Leather File',
    brand: 'Generic',
    stock: 30,
    images: ['/assets/Leather/LeatherFile.jpg'],
  },
  {
    name: 'Kaco Document Folder',
    description: 'High quality office document folder',
    price: 180,
    category: 'Office Supplies',
    subcategory: 'Folder',
    brand: 'Kaco',
    stock: 90,
    images: ['/assets/Folder/Kaco.webp'],
  },

  {
    name: 'Kaco A4 Size Folder',
    description: 'A4 size premium office folder',
    price: 220,
    category: 'Office Supplies',
    subcategory: 'Folder',
    brand: 'Kaco',
    stock: 70,
    images: ['/assets/Folder/KakcoA4Size.avif'],
  },

  /* ======================
     TOYS / GAMES
  ====================== */

  {
    name: 'Barbie Set',
    description: 'Kids Barbie toy set',
    price: 899,
    category: 'Toys',
    subcategory: 'Games',
    stock: 50,
    images: ['/assets/Toys/BarbieSet.jpg'],
  },

  {
    name: 'Business Board Game',
    description: 'Business strategy board game',
    price: 699,
    category: 'Toys',
    subcategory: 'Games',
    stock: 40,
    images: ['/assets/Toys/Business.jpg'],
  },

  {
    name: 'Chess Game',
    description: 'Classic chess board game',
    price: 499,
    category: 'Toys',
    subcategory: 'Games',
    stock: 60,
    images: ['/assets/Toys/Chess.webp'],
  },

  {
    name: 'Hot Wheels Car',
    description: 'Hot Wheels racing car',
    price: 299,
    category: 'Toys',
    subcategory: 'Games',
    stock: 100,
    images: ['/assets/Toys/HotWheels.jpg'],
  },

  {
    name: 'Kids Kitchen Set',
    description: 'Pretend play kitchen set',
    price: 1199,
    category: 'Toys',
    subcategory: 'Games',
    stock: 30,
    images: ['/assets/Toys/KichenSet.jpg'],
  },

  {
    name: 'Laptop Computer Toy',
    description: 'Educational laptop toy for kids',
    price: 899,
    category: 'Toys',
    subcategory: 'Games',
    stock: 40,
    images: ['/assets/Toys/LaptopComputer.jpg'],
  },

  {
    name: 'Kids Piano',
    description: 'Musical piano toy',
    price: 749,
    category: 'Toys',
    subcategory: 'Games',
    stock: 35,
    images: ['/assets/Toys/Piano.jpg'],
  },

  {
    name: 'Puzzle Game',
    description: 'Mind puzzle game for kids',
    price: 349,
    category: 'Toys',
    subcategory: 'Games',
    stock: 80,
    images: ['/assets/Toys/Puzzle.webp'],
  },

  {
    name: 'Skillmatics Foil Fun',
    description: 'Creative foil art activity',
    price: 599,
    category: 'Toys',
    subcategory: 'Games',
    stock: 45,
    images: ['/assets/Toys/SkillmaticsFoilFun.jpg'],
  },

  {
    name: 'Skillmatics Sizzle',
    description: 'Interactive educational game',
    price: 649,
    category: 'Toys',
    subcategory: 'Games',
    stock: 40,
    images: ['/assets/Toys/SkillmaticsSizzle.jpg'],
  },

  {
    name: 'Snake And Ladder',
    description: 'Classic snake and ladder board game',
    price: 299,
    category: 'Toys',
    subcategory: 'Games',
    stock: 90,
    images: ['/assets/Toys/SneakAndLadder.jpg'],
  },

  {
    name: 'Teddy Bear Blue',
    description: 'Soft blue teddy bear',
    price: 499,
    category: 'Toys',
    subcategory: 'Games',
    stock: 70,
    images: ['/assets/Toys/TeddyBlue.webp'],
  },

  {
    name: 'Teddy Bear Purple',
    description: 'Soft purple teddy bear',
    price: 499,
    category: 'Toys',
    subcategory: 'Games',
    stock: 70,
    images: ['/assets/Toys/TeddyPurple.jpg'],
  },

  {
    name: 'UNO Card Game',
    description: 'UNO classic card game',
    price: 249,
    category: 'Toys',
    subcategory: 'Games',
    stock: 120,
    images: ['/assets/Toys/Uno.jpg'],
  },

  /* ======================
     GIFT COLLECTION - PREMIUM PENS
  ====================== */

  {
    name: 'Pennline Premium Roller Pen',
    description: 'Luxury roller pen with smooth ink flow, perfect for gifting',
    price: 899,
    category: 'Gifts',
    subcategory: 'Premium Pens',
    brand: 'Pennline',
    stock: 50,
    images: ['/assets/Gift Collection/Pennline.webp'],
    featured: true
  },



  {
    name: 'Platinum Premium Fountain Pen',
    description: 'Exquisite fountain pen with platinum finish and superior writing experience',
    price: 1899,
    category: 'Gifts',
    subcategory: 'Premium Pens',
    brand: 'Platinum',
    stock: 25,
    images: ['/assets/Gift Collection/Platinum.webp'],
  },





















]

/* ======================
   DB CONNECT + SEED
====================== */
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/stationery_shop')
  .then(async () => {
    console.log('✅ MongoDB Connected')
    await Product.deleteMany({})
    await Product.insertMany(products)
    console.log('✅ Data Seeded Successfully')
    process.exit()
  })
  .catch((err) => {
    console.error('❌ Seeding Error:', err)
    process.exit(1)
  })
