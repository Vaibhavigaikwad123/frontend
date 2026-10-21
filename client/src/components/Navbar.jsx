import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart,
  User,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Moon,
  Sun,
  Heart,
  Search,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useWishlist } from '../context/WishlistContext';
import MegaMenu from './MegaMenu';
import api from '../utils/api';
import { getImageUrl } from '../utils/imageHelper';
import { formatPrice } from '../utils/formatPrice';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { wishlistCount } = useWishlist();
  const { darkMode, toggleDarkMode } = useTheme();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Debounced autocomplete search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get(`/products?search=${encodeURIComponent(searchQuery)}`);
        setSearchResults(res.data.slice(0, 6));
        setShowDropdown(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleResultClick = (productId) => {
    setShowDropdown(false);
    setSearchQuery('');
    navigate(`/product/${productId}`);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const categories = ['School Supplies', 'Art And Craft', 'Office Supplies', 'Toys', 'Gifts'];

  return (
    <>
      <nav className={`sticky top-0 z-[9999] transition-all duration-300 ${darkMode ? 'bg-gray-950 border-b border-gray-800 shadow-none' : 'bg-white border-b border-gray-200 shadow-md'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center gap-4">

            {/* LOGO */}
            <Link to="/" className="flex items-center group flex-shrink-0">
              <span className="text-xl md:text-2xl font-bold whitespace-nowrap">
                <span className="text-brand-600">Stationary</span>
                <span className={darkMode ? 'text-brand-300' : 'text-brand-500'}>Hub</span>
              </span>
            </Link>

            {/* DESKTOP MENU */}
            <div className="hidden xl:flex items-center space-x-1 h-full">
              {categories.map((cat) => (
                <div
                  key={cat}
                  className="relative px-3 h-16 flex items-center cursor-pointer"
                  onMouseEnter={() => setActiveCategory(cat)}
                  onMouseLeave={() => setActiveCategory(null)}
                >
                  <button className={`flex items-center text-sm font-semibold transition-colors ${darkMode ? 'text-gray-200 hover:text-brand-400' : 'text-black hover:text-brand-600'}`}>
                    {cat === 'Toys' ? 'Toys/Games' : cat === 'Gifts' ? 'Gift Collections' : cat}
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </button>
                </div>
              ))}
            </div>

            {/* ── SEARCH BAR ── */}
            <div className="flex-1 max-w-sm relative" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                  placeholder="Search products..."
                  className={`w-full pl-10 pr-4 py-2 rounded-xl text-sm border transition-all outline-none focus:ring-2 focus:ring-brand-500 ${darkMode
                    ? 'bg-gray-900 border-gray-800 text-gray-100 placeholder-gray-600'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                />
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                )}
              </form>

              {/* Autocomplete Dropdown */}
              {showDropdown && searchResults.length > 0 && (
                <div className={`absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-2xl border z-[99999] overflow-hidden ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                  {searchResults.map((product) => (
                    <button
                      key={product._id}
                      onClick={() => handleResultClick(product._id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img src={getImageUrl(product.images?.[0])} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{product.name}</p>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{product.category}</p>
                      </div>
                      <span className={`text-sm font-bold flex-shrink-0 ${darkMode ? 'text-brand-400' : 'text-brand-600'}`}>{formatPrice(product.price)}</span>
                    </button>
                  ))}
                  <button
                    onClick={handleSearchSubmit}
                    className={`w-full px-4 py-3 text-xs font-bold uppercase tracking-widest text-center transition-colors border-t ${darkMode ? 'border-gray-800 text-brand-400 hover:bg-gray-800' : 'border-gray-100 text-brand-600 hover:bg-gray-50'}`}
                  >
                    See all results for "{searchQuery}"
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                id="theme-toggle"
                onClick={toggleDarkMode}
                className={`p-2 transition-colors ${darkMode ? 'text-gray-200 hover:text-brand-400' : 'text-black hover:text-brand-600'}`}
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {darkMode ? <Moon size={20} /> : <Sun size={20} />}
              </button>

              <Link to="/wishlist" className="relative p-2 text-black dark:text-gray-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link to="/cart" className="relative p-2 text-black dark:text-gray-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                <ShoppingCart size={20} />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                    {count}
                  </span>
                )}
              </Link>

              <div className="hidden md:block">
                {user ? (
                  <div className="flex items-center space-x-2">
                    <Link to="/profile" className="flex items-center group">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold text-sm">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                    </Link>
                    <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-600 transition-colors">
                      <LogOut size={18} />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => navigate('/login')} className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 rounded-full hover:bg-brand-700 transition-all">
                    Login
                  </button>
                )}
              </div>

              <div className="md:hidden">
                <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-700 dark:text-gray-200">
                  {isOpen ? <X /> : <Menu />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MEGA MENU */}
        {activeCategory && (
          <div
            className="absolute left-0 top-full w-full z-[100]"
            onMouseEnter={() => setActiveCategory(activeCategory)}
            onMouseLeave={() => setActiveCategory(null)}
          >
            <MegaMenu activeCategory={activeCategory} onClose={() => setActiveCategory(null)} />
          </div>
        )}

        {/* MOBILE MENU */}
        {isOpen && (
          <div className={`md:hidden border-t p-4 space-y-4 ${darkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'}`}>
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className={`w-full pl-10 pr-4 py-2 rounded-xl text-sm border outline-none ${darkMode ? 'bg-gray-900 border-gray-800 text-gray-100' : 'bg-gray-50 border-gray-200'}`}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </form>
            <div className="space-y-1">
              <Link className={`block px-4 py-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-900 text-gray-200' : 'hover:bg-gray-50 text-black'}`} to="/shop" onClick={() => setIsOpen(false)}>Shop</Link>
              <Link className={`block px-4 py-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-900 text-gray-200' : 'hover:bg-gray-50 text-black'}`} to="/compare" onClick={() => setIsOpen(false)}>🔄 Compare Products</Link>
              <Link className={`block px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${darkMode ? 'hover:bg-gray-900 text-gray-200' : 'hover:bg-gray-50 text-black'}`} to="/wishlist" onClick={() => setIsOpen(false)}>
                <Heart size={18} /> Wishlist ({wishlistCount})
              </Link>
              <Link className={`block px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${darkMode ? 'hover:bg-gray-900 text-gray-200' : 'hover:bg-gray-50 text-black'}`} to="/cart" onClick={() => setIsOpen(false)}>
                <ShoppingCart size={18} /> Cart ({count})
              </Link>
              {user ? (
                <>
                  <Link className={`block px-4 py-3 text-gray-700 dark:text-gray-200 rounded-lg ${darkMode ? 'hover:bg-gray-900' : 'hover:bg-gray-50'}`} to="/profile" onClick={() => setIsOpen(false)}>Profile</Link>
                  <button onClick={() => { handleLogout(); setIsOpen(false); }} className={`block w-full text-left px-4 py-3 text-red-600 dark:text-red-400 rounded-lg ${darkMode ? 'hover:bg-gray-900' : 'hover:bg-gray-50'}`}>Logout</button>
                </>
              ) : (
                <>
                  <Link className={`block px-4 py-3 rounded-lg ${darkMode ? 'hover:bg-gray-900 text-gray-200' : 'hover:bg-gray-50 text-black'}`} to="/login" onClick={() => setIsOpen(false)}>Login</Link>
                  <Link className={`block px-4 py-3 rounded-lg ${darkMode ? 'hover:bg-gray-900 text-gray-200' : 'hover:bg-gray-50 text-black'}`} to="/register" onClick={() => setIsOpen(false)}>Register</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
