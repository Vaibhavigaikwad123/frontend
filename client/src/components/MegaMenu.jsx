import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

/* =========================
   MEGA MENU DATA
========================= */
const megaMenuData = {
  'School Supplies': [
    {
      title: 'Stationery Basics',
      items: [
        'Pencils',
        'Sharpeners',
        'Erasers',
        'Mechanical Pencils',
        'Notebooks',
        'Glue',
      ],
    },
    {
      title: 'School Utility',
      items: ['Ball Pens', 'Highlighters', 'Markers'],
    },
  ],

  'Art And Craft': [
    {
      title: 'Junior Art',
      items: [
        'Color Pencils',
        'Sketch Pens',
        'Acrylic Colors',
        'Water Colors',
        'Pastel Colors',
      ],
    },
    {
      title: 'Knives, Brushes & Palettes',
      items: ['Water Color Brush', 'Palette'],
    },
  ],

  'Office Supplies': [
    {
      title: 'Office Essentials',
      items: [
        'Staplers',
        'Scissors',
        'Pins And Clips',
        'Pen Stands',
        'Calculators',
        'Plastic Files',
        'Leather Files',
        'Folders',
      ],
    },
  ],

  'Toys': [
    {
      title: 'Games & Toys',
      items: ['Games'],
    },
  ],
  'Gifts': [
    {
      title: 'Luxury Collections',
      items: ['Premium Pens'],
    },
  ],
}

/* =========================
   LINK LOGIC (100% MATCHED)
========================= */
const getShopLink = (item, activeCategory) => {
  /* ===== SCHOOL SUPPLIES ===== */
  if (item === 'Pencils') return '/shop?subcategory=Stationery Basics'
  if (item === 'Sharpeners') return '/shop?subcategory=Pencil Sharpener'
  if (item === 'Erasers') return '/shop?subcategory=Eraser'
  if (item === 'Mechanical Pencils') return '/shop?subcategory=Mechanical Pencil'
  if (item === 'Notebooks') return '/shop?subcategory=Notebook'
  if (item === 'Glue') return '/shop?subcategory=Glue'
  if (item === 'Ball Pens') return '/shop?subcategory=Pens'
  if (item === 'Highlighters') return '/shop?subcategory=Highlighter'
  if (item === 'Markers') return '/shop?subcategory=Marker'
  if (item === 'Diaries') return '/shop?subcategory=Diary'
  if (item === 'Drawing Books') return '/shop?subcategory=Drawing Book'

  /* ===== ART & CRAFT ===== */
  if (item === 'Color Pencils')
    return '/shop?category=Art And Craft&subcategory=Color Pencil'
  if (item === 'Sketch Pens')
    return '/shop?category=Art And Craft&subcategory=Sketch Pen'
  if (item === 'Acrylic Colors')
    return '/shop?category=Art And Craft&subcategory=Acrylic Color'
  if (item === 'Water Colors')
    return '/shop?category=Art And Craft&subcategory=Water Color'
  if (item === 'Pastel Colors')
    return '/shop?category=Art And Craft&subcategory=Pastel Color'
  if (item === 'Water Color Brush')
    return '/shop?category=Art And Craft&subcategory=Water Color Brush'
  if (item === 'Palette')
    return '/shop?category=Art And Craft&subcategory=Palette'

  /* ===== OFFICE SUPPLIES ===== */
  if (item === 'Staplers')
    return '/shop?category=Office Supplies&subcategory=Stapler'
  if (item === 'Scissors')
    return '/shop?category=Office Supplies&subcategory=Scissors'
  if (item === 'Pins And Clips')
    return '/shop?category=Office Supplies&subcategory=Pins And Clips'
  if (item === 'Pen Stands')
    return '/shop?category=Office Supplies&subcategory=Pen Stand'
  if (item === 'Calculators')
    return '/shop?category=Office Supplies&subcategory=Calculator'
  if (item === 'Plastic Files')
    return '/shop?category=Office Supplies&subcategory=Plastic File'
  if (item === 'Leather Files')
    return '/shop?category=Office Supplies&subcategory=Leather File'
  if (item === 'Folders')
    return '/shop?category=Office Supplies&subcategory=Folder'

  /* ===== TOYS ===== */
  if (item === 'Games')
    return '/shop?category=Toys&subcategory=Games'
  if (item === 'Premium Pens')
    return '/shop?category=Gifts&subcategory=Premium Pens'

  /* DEFAULT */
  return `/shop?category=${encodeURIComponent(activeCategory)}`
}

import { useTheme } from '../context/ThemeContext'

/* =========================
   COMPONENT
========================= */
const MegaMenu = ({ activeCategory, onClose }) => {
  const { darkMode } = useTheme()
  if (!activeCategory || !megaMenuData[activeCategory]) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={`w-full shadow-xl border-t z-50 py-8 transition-all duration-300 ${darkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'}`}
      onMouseLeave={onClose}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {megaMenuData[activeCategory].map((section, idx) => (
            <div key={idx}>
              <h3 className={`text-sm font-bold uppercase border-b pb-2 mb-3 transition-colors ${darkMode ? 'border-gray-800 text-gray-100' : 'border-gray-100 text-black'}`}>
                {section.title}
              </h3>

              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item}>
                    <Link
                      to={getShopLink(item, activeCategory)}
                      onClick={onClose}
                      className={`text-sm hover:underline transition-colors ${darkMode ? 'text-gray-400 hover:text-brand-400' : 'text-gray-600 hover:text-brand-600'}`}
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* SIDE CARD */}
          <div className={`hidden lg:block p-6 rounded-lg transition-colors ${darkMode ? 'bg-brand-900/10' : 'bg-brand-50 border border-brand-200'}`}>
            <h3 className={`font-bold text-lg mb-2 ${darkMode ? 'text-brand-100' : 'text-black'}`}>
              Explore {activeCategory}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 transition-colors">
              Discover premium quality products.
            </p>
            <Link
              to={`/shop?category=${encodeURIComponent(activeCategory)}`}
              onClick={onClose}
              className="text-brand-600 dark:text-brand-400 font-semibold hover:underline transition-colors"
            >
              Shop All →
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default MegaMenu
