import React, { useState } from 'react'
import clsx from 'clsx'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

/* =========================
   BRAND CONFIG
========================= */

// -------- SCHOOL SUPPLIES --------
const PENCIL_BRANDS = [
  { name: 'Staedtler', image: '/assets/PencilBrand/Staedtler.jpg' },
  { name: 'Apsara', image: '/assets/PencilBrand/Apsara.jpeg' },
  { name: 'Nataraj', image: '/assets/PencilBrand/Natraj.jpg' },
  { name: 'Faber-Castell', image: '/assets/PencilBrand/Faber-Castell.jpg' },
  { name: 'Camlin', image: '/assets/PencilBrand/Camlin.jpeg' },
  { name: 'Doms', image: '/assets/PencilBrand/Doms.jpeg' },
  { name: 'Uni Ball', image: '/assets/PencilBrand/Uni Ball.jpg' },
  { name: 'Scholar', image: '/assets/PencilBrand/Scholar.jpg' },
]

const SHARPENER_BRANDS = [
  { name: 'Apsara', image: '/assets/SharpenerBrand/Apsara.jpg' },
  { name: 'Nataraj', image: '/assets/SharpenerBrand/Nataraj.jpg' },
  { name: 'Keyroad', image: '/assets/SharpenerBrand/Keyroad.jpg' },
]

const ERASER_BRANDS = [
  { name: 'Apsara', image: '/assets/EraserBrand/Apsara.png' },
  { name: 'Nataraj', image: '/assets/EraserBrand/Nataraj.jpg' },
  { name: 'Keyroad', image: '/assets/EraserBrand/Keyroad.jpg' },
]

const MECHANICAL_PENCIL_BRANDS = [
  { name: 'Kaco', image: '/assets/MechanicalPencilBrand/Kaco.webp' },
  { name: 'Sakura', image: '/assets/MechanicalPencilBrand/Sakura.webp' },
  { name: 'Uni Ball', image: '/assets/MechanicalPencilBrand/UniBall.webp' },
]

const NOTEBOOK_BRANDS = [
  { name: 'Classmate', image: '/assets/NotebookBrand/Classmate.avif' },
  { name: 'Doms', image: '/assets/NotebookBrand/Doms.webp' },
]

const PEN_BRANDS = [
  { name: 'Cello', image: '/assets/PenBrand/Cello.jpg' },
  { name: 'Uni Ball', image: '/assets/PenBrand/UniBall.jpg' },
]

const GLUE_BRANDS = [
  { name: 'Pidilite', image: '/assets/GlueBrand/Pidilite.jpg' },
  { name: 'Faber-Castell', image: '/assets/GlueBrand/Faber-Castell.jpg' },
]

const HIGHLIGHTER_BRANDS = [
  { name: 'Faber-Castell', image: '/assets/HighlighterBrand/faber-castell.jpg' },
  { name: 'Stabilo', image: '/assets/HighlighterBrand/Stablio.jpg' },
  { name: 'Staedtler', image: '/assets/HighlighterBrand/Staedtler.jpg' },
]

const MARKER_BRANDS = [
  { name: 'Luxor', image: '/assets/Marker/Luxor-Marker.webp' },
  { name: 'Morris', image: '/assets/Marker/Morris.webp' },
  { name: 'Staedtler', image: '/assets/Marker/Staedtler.jpg' },
]

// -------- ART & CRAFT --------
const COLOR_PENCIL_BRANDS = [
  { name: 'Faber-Castell', image: '/assets/ColourPencil/Faber-castell.webp' },
  { name: 'Doms', image: '/assets/ColourPencil/Doms.webp' },
  { name: 'Derwent', image: '/assets/ColourPencil/Derwant.jpg' },
  { name: 'Koh-i-Noor', image: '/assets/ColourPencil/Koh-i-noor.jpg' },
  { name: 'Conte a Paris', image: '/assets/ColourPencil/conte-a-paris-sets.jpg' },
]

const SKETCH_PEN_BRANDS = [
  { name: 'Camlin', image: '/assets/SketchPen/Camlin.jpg' },
  { name: 'Doms', image: '/assets/SketchPen/Doms.webp' },
  { name: 'Faber-Castell', image: '/assets/SketchPen/Faber-Castell.jpg' },
  { name: 'Zunbella', image: '/assets/SketchPen/Zunbella.jpg' },
]

const ACRYLIC_COLOR_BRANDS = [
  { name: 'Brustro', image: '/assets/AcrylicColor/Brustro.webp' },
  { name: 'Camel', image: '/assets/AcrylicColor/Camel.webp' },
  { name: 'Faber-Castell', image: '/assets/AcrylicColor/Faber-Castell.jpg' },
  { name: 'Liquitex', image: '/assets/AcrylicColor/Liquitex.jpg' },
  { name: 'MontMarte', image: '/assets/AcrylicColor/MontMarte.webp' },
  { name: 'Pidilite', image: '/assets/AcrylicColor/Pidilite.avif' }

]

const WATER_COLOR_BRANDS = [
  { name: 'Brustro', image: '/assets/WaterColor/Brusto.jpg' },
  { name: 'Camlin', image: '/assets/WaterColor/Camlin.jpg' },
  { name: 'Derwent', image: '/assets/WaterColor/Derwant.jpg' },
  { name: 'Faber-Castell', image: '/assets/WaterColor/Faber-Castell.jpg' },
  { name: 'MontMarte', image: '/assets/WaterColor/MontMarte.jpg' },
  { name: 'Sakura', image: '/assets/WaterColor/Sakura.jpg' },
]

const PASTEL_COLOR_BRANDS = [
  { name: 'Brustro', image: '/assets/PastelColor/Brustro.jpg' },
  { name: 'Camlin', image: '/assets/PastelColor/Camlin.jpeg' },
  { name: 'Faber-Castell', image: '/assets/PastelColor/FaberCastell.webp' },
]

const WATER_COLOR_BRUSH_BRANDS = [
  { name: 'Brustro', image: '/assets/WaterColorBrush/Brustro.webp' },
  { name: 'Camlin', image: '/assets/WaterColorBrush/Camlin.jpg' },
  { name: 'Faber-Castell', image: '/assets/WaterColorBrush/FaberCastell.jpg' },
  { name: 'Liquitex', image: '/assets/WaterColorBrush/Liquitex.webp' },
  { name: 'MontMarte', image: '/assets/WaterColorBrush/MontMarte.jpg' },
]

const PALETTE_BRANDS = [
  { name: 'Khyati', image: '/assets/Palette/Khyati.webp' },
]

// Office
const STAPLER_BRANDS = [{ name: 'Kangaro', image: '/assets/Stapler/Kangaro.webp' }]
const SCISSORS_BRAND = [{ name: 'Maped', image: '/assets/Scissors/Maped.jpg' }]
const PINS_AND_CLIPS_BRANDS = [
  { name: 'Omega', image: '/assets/PinsAndClips/Omega.jpg' },
  { name: 'Worldone', image: '/assets/PinsAndClips/Worldone.webp' },
]
const PENSTAND_BRANDS = [{ name: 'Khayati', image: '/assets/PenStand/Khayati.webp' }]
const CALCULTOR_BRANDS = [{ name: 'Casio', image: '/assets/Calculator/Casio.avif' }]
const PLASTICFILE_BRANDS = [{ name: 'Worldone', image: '/assets/PlasticFile/Worldone.webp' }]
const LEATHERFILE_BRANDS = [{ name: 'Generic', image: '/assets/Leather/Leather.webp' }]
const FOLDERS_BRANDS = [{ name: 'Kaco', image: '/assets/Folder/Kaco.webp' }]

// -------- TOYS & GIFTS --------
const TOY_BRANDS = [
  { name: 'Mattel', image: '/assets/Toys/Uno.jpg' },
  { name: 'Skillmatics', image: '/assets/Toys/SkillmaticsFoilFun.jpg' },
]

const GIFT_BRANDS = [
  { name: 'Pennline', image: '/assets/Gift Collection/Pennline.webp' },
  { name: 'Platinum', image: '/assets/Gift Collection/Platinum.webp' },
]

// Categories
const CATEGORIES = ['School Supplies', 'Art And Craft', 'Office Supplies', 'Toys', 'Gifts']

// Price ranges
const PRICE_RANGES = [
  { label: '₹0 – ₹99', min: 0, max: 99 },
  { label: '₹99 – ₹299', min: 99, max: 299 },
  { label: '₹299 – ₹699', min: 299, max: 699 },
  { label: '₹699 – ₹999', min: 699, max: 999 },
]

/* =========================
   COMPONENT
========================= */

const FilterSidebar = ({ filters, setFilters, products, className }) => {
  const { darkMode } = useTheme()
  const [isBrandOpen, setIsBrandOpen] = useState(true)
  const [isPriceOpen, setIsPriceOpen] = useState(true)
  const [isCategoryOpen, setIsCategoryOpen] = useState(true)

  const sub = filters.subcategory?.[0] || ''

  /* =========================
     SUBCATEGORY → BRAND MAP
  ========================= */
  let brandList = []

  if (sub === 'Stationery Basics') brandList = PENCIL_BRANDS
  else if (sub === 'Pencil Sharpener') brandList = SHARPENER_BRANDS
  else if (sub === 'Eraser') brandList = ERASER_BRANDS
  else if (sub === 'Mechanical Pencil') brandList = MECHANICAL_PENCIL_BRANDS
  else if (sub === 'Notebook') brandList = NOTEBOOK_BRANDS
  else if (sub === 'Pens') brandList = PEN_BRANDS
  else if (sub === 'Glue') brandList = GLUE_BRANDS
  else if (sub === 'Highlighter') brandList = HIGHLIGHTER_BRANDS
  else if (sub === 'Marker') brandList = MARKER_BRANDS
  else if (sub === 'Color Pencil') brandList = COLOR_PENCIL_BRANDS
  else if (sub === 'Sketch Pen') brandList = SKETCH_PEN_BRANDS
  else if (sub === 'Acrylic Color') brandList = ACRYLIC_COLOR_BRANDS
  else if (sub === 'Water Color') brandList = WATER_COLOR_BRANDS
  else if (sub === 'Pastel Color') brandList = PASTEL_COLOR_BRANDS
  else if (sub === 'Water Color Brush') brandList = WATER_COLOR_BRUSH_BRANDS
  else if (sub === 'Palette') brandList = PALETTE_BRANDS
  else if (sub === 'Stapler') brandList = STAPLER_BRANDS
  else if (sub === 'Scissors') brandList = SCISSORS_BRAND
  else if (sub === 'Pins And Clips') brandList = PINS_AND_CLIPS_BRANDS
  else if (sub === 'Pen Stand') brandList = PENSTAND_BRANDS
  else if (sub === 'Calculator') brandList = CALCULTOR_BRANDS
  else if (sub === 'Plastic File') brandList = PLASTICFILE_BRANDS
  else if (sub === 'Leather File') brandList = LEATHERFILE_BRANDS
  else if (sub === 'Folder') brandList = FOLDERS_BRANDS
  else if (sub === 'Games' || filters.category?.includes('Toys')) brandList = TOY_BRANDS
  else if (sub === 'Premium Pens' || filters.category?.includes('Gifts')) brandList = GIFT_BRANDS

  /* =========================
     HELPERS
  ========================= */
  const getBrandCount = (brand) =>
    products.filter((p) => p.brand === brand).length

  const toggleBrand = (brand) => {
    const current = filters.brands || []
    const updated = current.includes(brand)
      ? current.filter((b) => b !== brand)
      : [...current, brand]

    setFilters({ ...filters, brands: updated })
  }

  const toggleCategory = (cat) => {
    const current = filters.category || []
    const updated = current.includes(cat)
      ? current.filter((c) => c !== cat)
      : [...current, cat]

    setFilters({ ...filters, category: updated })
  }

  const togglePrice = (r) => {
    if (filters.minPrice === r.min && filters.maxPrice === r.max) {
      setFilters({ ...filters, minPrice: null, maxPrice: null })
    } else {
      setFilters({ ...filters, minPrice: r.min, maxPrice: r.max })
    }
  }

  const clearFilters = () => {
    setFilters({
      category: [],
      subcategory: [],
      brands: [],
      minPrice: null,
      maxPrice: null,
      search: '',
    })
  }

  /* =========================
     UI
  ========================= */

  return (
    <div className={clsx('w-full md:w-64 space-y-6', className)}>
      {/* Clear All Filters Button */}
      <button
        onClick={clearFilters}
        className={`w-full px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm border ${darkMode
          ? 'bg-red-900/20 text-red-400 border-red-800 hover:bg-red-900/30'
          : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
          }`}
      >
        Clear All Filters
      </button>

      {/* SHOP BY BRAND */}
      {brandList.length > 0 && (
        <div className={`rounded-xl border shadow-sm transition-all ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
          }`}>
          <button
            onClick={() => setIsBrandOpen(!isBrandOpen)}
            className={`flex items-center justify-between w-full p-4 font-bold transition-colors ${darkMode ? 'text-gray-100 hover:text-brand-400' : 'text-gray-900 hover:text-brand-600'
              }`}
          >
            <span className="text-base">Shop By Brand</span>
            {isBrandOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>

          {isBrandOpen && (
            <div className={`px-4 pb-4 space-y-3 border-t ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
              <div className="pt-4 space-y-3">
                {brandList.map(({ name, image }) => (
                  <label key={name} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      className={`w-4 h-4 rounded focus:ring-2 focus:ring-brand-500 transition-colors cursor-pointer ${darkMode ? 'border-gray-700 bg-gray-800 text-brand-500' : 'border-gray-300 bg-white text-brand-600'
                        }`}
                      checked={(filters.brands || []).includes(name)}
                      onChange={() => toggleBrand(name)}
                    />
                    <img src={image} alt={name} className="w-8 h-8 object-contain rounded" />
                    <span className={`text-sm font-medium transition-colors flex-1 ${darkMode ? 'text-gray-300 group-hover:text-brand-400' : 'text-gray-700 group-hover:text-brand-600'
                      }`}>
                      {name}
                    </span>
                    <span className={`text-xs font-semibold ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      ({getBrandCount(name)})
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SHOP BY PRICE */}
      <div className={`rounded-xl border shadow-sm transition-all ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        }`}>
        <button
          onClick={() => setIsPriceOpen(!isPriceOpen)}
          className={`flex items-center justify-between w-full p-4 font-bold transition-colors ${darkMode ? 'text-gray-100 hover:text-brand-400' : 'text-gray-900 hover:text-brand-600'
            }`}
        >
          <span className="text-base">Shop By Price</span>
          {isPriceOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </button>

        {isPriceOpen && (
          <div className={`px-4 pb-4 space-y-3 border-t ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
            <div className="pt-4 space-y-2.5">
              {PRICE_RANGES.map((r) => (
                <label key={r.label} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className={`w-4 h-4 rounded focus:ring-2 focus:ring-brand-500 transition-colors cursor-pointer ${darkMode ? 'border-gray-700 bg-gray-800 text-brand-500' : 'border-gray-300 bg-white text-brand-600'
                      }`}
                    checked={filters.minPrice === r.min && filters.maxPrice === r.max}
                    onChange={() => togglePrice(r)}
                  />
                  <span className={`text-sm font-medium transition-colors ${darkMode ? 'text-gray-300 group-hover:text-brand-400' : 'text-gray-700 group-hover:text-brand-600'
                    }`}>
                    {r.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SHOP BY CATEGORY */}
      <div className={`rounded-xl border shadow-sm transition-all ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        }`}>
        <button
          onClick={() => setIsCategoryOpen(!isCategoryOpen)}
          className={`flex items-center justify-between w-full p-4 font-bold transition-colors ${darkMode ? 'text-gray-100 hover:text-brand-400' : 'text-gray-900 hover:text-brand-600'
            }`}
        >
          <span className="text-base">Shop By Category</span>
          {isCategoryOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </button>

        {isCategoryOpen && (
          <div className={`px-4 pb-4 space-y-3 border-t ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
            <div className="pt-4 space-y-2.5">
              {CATEGORIES.map((c) => (
                <label key={c} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className={`w-4 h-4 rounded focus:ring-2 focus:ring-brand-500 transition-colors cursor-pointer ${darkMode ? 'border-gray-700 bg-gray-800 text-brand-500' : 'border-gray-300 bg-white text-brand-600'
                      }`}
                    checked={(filters.category || []).includes(c)}
                    onChange={() => toggleCategory(c)}
                  />
                  <span className={`text-sm font-medium transition-colors ${darkMode ? 'text-gray-300 group-hover:text-brand-400' : 'text-gray-700 group-hover:text-brand-600'
                    }`}>
                    {c}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FilterSidebar
