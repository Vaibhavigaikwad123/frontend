import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import api from '../utils/api'
import { Filter, X, ChevronDown } from 'lucide-react'
import FilterSidebar from '../components/FilterSidebar'
import ProductCard from '../components/ProductCard'

const Shop = () => {
  const { darkMode } = useTheme()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  const [sortBy, setSortBy] = useState('popularity')

  const [filters, setFilters] = useState({
    category: searchParams.get('category') ? searchParams.get('category').split(',') : [],
    subcategory: searchParams.get('subcategory') ? searchParams.get('subcategory').split(',') : [],
    brands: searchParams.get('brands') ? searchParams.get('brands').split(',') : [],
    minPrice: searchParams.get('minPrice'),
    maxPrice: searchParams.get('maxPrice'),
    search: searchParams.get('search') || '',
  })

  useEffect(() => {
    setFilters({
      category: searchParams.get('category') ? searchParams.get('category').split(',') : [],
      subcategory: searchParams.get('subcategory') ? searchParams.get('subcategory').split(',') : [],
      brands: searchParams.get('brands') ? searchParams.get('brands').split(',') : [],
      minPrice: searchParams.get('minPrice'),
      maxPrice: searchParams.get('maxPrice'),
      search: searchParams.get('search') || '',
    })
  }, [searchParams])

  const fetchProducts = useCallback(async (currentFilters) => {
    setLoading(true)
    try {
      const params = {}
      if (currentFilters.category.length) params.category = currentFilters.category.join(',')
      if (currentFilters.subcategory.length) params.subcategory = currentFilters.subcategory.join(',')
      if (currentFilters.brands.length) params.brands = currentFilters.brands.join(',')
      if (currentFilters.minPrice) params.minPrice = currentFilters.minPrice
      if (currentFilters.maxPrice) params.maxPrice = currentFilters.maxPrice
      if (currentFilters.search) params.search = currentFilters.search

      const res = await api.get('/products', { params })
      setProducts(res.data)
    } catch (err) {
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const params = {}
    if (filters.category.length) params.category = filters.category.join(',')
    if (filters.subcategory.length) params.subcategory = filters.subcategory.join(',')
    if (filters.brands.length) params.brands = filters.brands.join(',')
    if (filters.minPrice) params.minPrice = filters.minPrice
    if (filters.maxPrice) params.maxPrice = filters.maxPrice
    if (filters.search) params.search = filters.search

    setSearchParams(params, { replace: true })
    fetchProducts(filters)
  }, [filters, setSearchParams, fetchProducts])

  const sub = filters.subcategory?.[0] || ''
  const cat = filters.category?.[0] || ''
  const pageTitleMap = {
    'Stationery Basics': 'Pencils',
    'Pencil Sharpener': 'Sharpeners',
    'Eraser': 'Erasers',
    'Mechanical Pencil': 'Mechanical Pencils',
    'Notebook': 'Notebooks',
    'Diary': 'Diaries',
    'Drawing Book': 'Drawing Books',
    'Pens': 'Pens',
    'Highlighter': 'Highlighters',
    'Marker': 'Markers',
    'Glue': 'Glue',
    'Color Pencil': 'Color Pencils',
    'Sketch Pen': 'Sketch Pens',
    'Acrylic Color': 'Acrylic Colors',
    'Water Color': 'Water Colors',
    'Pastel Color': 'Pastel Colors',
    'Water Color Brush': 'Water Color Brush',
    'Palette': 'Palette',
    'Stapler': 'Staplers',
    'Scissors': 'Scissors',
    'Pins And Clips': 'Pins & Clips',
    'Pen Stand': 'Pen Stands',
    'Calculator': 'Calculators',
    'Plastic File': 'Plastic Files',
    'Leather File': 'Leather Files',
    'Folder': 'Folders',
    'Games': 'Toys & Games',
  }

  const categoryTitleMap = {
    'School Supplies': 'School Supplies',
    'Art And Craft': 'Art & Craft',
    'Office Supplies': 'Office Supplies',
    'Toys': 'Toys & Games',
    'Gifts': 'Gifts',
  }

  const pageTitle = searchParams.get('title') || pageTitleMap[sub] || categoryTitleMap[cat] || 'All Products'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between border-b pb-6 mb-6 gap-6">
        <div className="flex-1">
          <nav className="flex items-center text-xs font-medium text-gray-500 mb-2 uppercase tracking-widest">
            <Link to="/" className="hover:text-brand-600 transition-colors">Home</Link>
            <span className={`mx-2 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>/</span>
            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{pageTitle}</span>
          </nav>
          <h1 className={`text-4xl font-bold tracking-tight ${darkMode ? 'text-gray-50' : 'text-black'}`}>{pageTitle}</h1>
          <p className={`mt-1 font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {products.length} premium items found
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {/* SORTING */}
          <div className="relative w-full sm:w-64">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`w-full border rounded-xl px-4 py-2.5 text-sm font-semibold transition-all focus:ring-2 focus:ring-brand-500 outline-none appearance-none cursor-pointer pr-10 shadow-sm ${darkMode ? 'bg-gray-900 border-gray-800 text-gray-300' : 'bg-white border-gray-200 text-gray-700'}`}
            >
              <option value="popularity">Sort by: Popularity</option>
              <option value="alphabetical_az">Alphabetically, A-Z</option>
              <option value="alphabetical_za">Alphabetically, Z-A</option>
              <option value="price_low_high">Price, low to high</option>
              <option value="price_high_low">Price, high to low</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVE FILTERS (CHIPS) */}
      {(filters.brands.length > 0 || filters.minPrice || filters.category.length > 0) && (
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex flex-col gap-4">
            <h2 className={`text-3xl font-bold decoration-brand-600 underline underline-offset-8 ${darkMode ? 'text-brand-100' : 'text-black'}`}>
              Filters
            </h2>

            <div className="flex flex-wrap items-center gap-3">
              {filters.brands.map(brand => (
                <div key={brand} className={`flex items-center px-6 py-2.5 rounded-full text-sm md:text-base font-semibold transition-all ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-200 text-gray-800'}`}>
                  <span>Shop By Brand: {brand}</span>
                  <button
                    onClick={() => setFilters({ ...filters, brands: filters.brands.filter(b => b !== brand) })}
                    className="ml-4 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <X size={20} strokeWidth={2.5} />
                  </button>
                </div>
              ))}
              {(filters.minPrice || filters.maxPrice) && (
                <div className={`flex items-center px-6 py-2.5 rounded-full text-sm md:text-base font-semibold transition-all ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-200 text-gray-800'}`}>
                  <span>Shop By Price: ₹{filters.minPrice} to ₹{filters.maxPrice}</span>
                  <button
                    onClick={() => setFilters({ ...filters, minPrice: null, maxPrice: null })}
                    className="ml-4 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <X size={20} strokeWidth={2.5} />
                  </button>
                </div>
              )}
              {filters.category.map(cat => (
                <div key={cat} className={`flex items-center px-6 py-2.5 rounded-full text-sm md:text-base font-semibold transition-all ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-200 text-gray-800'}`}>
                  <span>Category: {cat}</span>
                  <button
                    onClick={() => setFilters({ ...filters, category: filters.category.filter(c => c !== cat) })}
                    className="ml-4 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <X size={20} strokeWidth={2.5} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setFilters({ category: [], subcategory: [], brands: [], minPrice: null, maxPrice: null, search: '' })}
                className={`text-lg font-bold hover:underline decoration-2 underline-offset-4 ml-2 ${darkMode ? 'text-gray-100' : 'text-black'}`}
              >
                Clear all filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BODY */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* FILTER SIDEBAR */}
        {pageTitle !== 'Toys & Games' && (
          <div
            className={`fixed inset-0 z-40 p-6 overflow-y-auto transition-all duration-300
            ${isMobileFiltersOpen ? 'translate-x-0' : '-translate-x-full'}
            ${darkMode ? 'bg-gray-950' : 'bg-white'}
            md:static md:translate-x-0 md:bg-transparent md:p-0 md:w-64`}
          >
            <FilterSidebar
              filters={filters}
              setFilters={setFilters}
              products={products}
            />
          </div>
        )}

        {/* PRODUCT GRID */}
        <div className="flex-1">
          {loading ? (
            <p className="text-center py-20 text-gray-500">Loading items...</p>
          ) : products.length === 0 ? (
            <div className={`text-center py-20 rounded-3xl border-2 border-dashed transition-colors ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
              <p className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>No products found</p>
              <div className="mt-6">
                <button
                  onClick={() => setFilters({ category: [], subcategory: [], brands: [], minPrice: null, maxPrice: null, search: '' })}
                  className="px-6 py-2 bg-brand-600 text-white font-bold rounded-full hover:bg-brand-700 transition-colors shadow-sm"
                >
                  View all products
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...products].sort((a, b) => {
                if (sortBy === 'price_low_high') return a.price - b.price;
                if (sortBy === 'price_high_low') return b.price - a.price;
                if (sortBy === 'alphabetical_az') return a.name.localeCompare(b.name);
                if (sortBy === 'alphabetical_za') return b.name.localeCompare(a.name);
                if (sortBy === 'popularity') return (b.numReviews || 0) - (a.numReviews || 0);
                return 0;
              }).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Shop
