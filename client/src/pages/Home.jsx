import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { useTheme } from "../context/ThemeContext";
import api from "../utils/api";

const Home = () => {
  const { darkMode } = useTheme();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get("/products?featured=true");
        setFeaturedProducts(res.data.slice(0, 4));
      } catch (err) {
        console.error("Error fetching featured products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="space-y-12 pb-12">

      <section className="relative overflow-hidden bg-brand-900 text-white min-h-[40vh] md:min-h-[55vh] flex items-center">
        <div className="absolute inset-0 bg-black/40"></div>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: 'url("/assets/hero/hero.jpg")' }}
        ></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 tracking-tight leading-tight">
            Elevate Your <br />
            <span className="text-brand-100">Study & Work Space</span>
          </h1>
          <p className="text-base md:text-lg mb-8 max-w-xl font-medium text-gray-200 leading-relaxed">
            Premium stationery, art supplies, and office essentials delivered
            to your doorstep.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center px-7 py-3 rounded-xl text-base font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 bg-white text-brand-900 hover:bg-brand-50"
          >
            Shop Now <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>


      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-medium text-black dark:text-gray-50 mb-6 text-center transition-colors">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Link to="/shop?category=School Supplies" className="group relative rounded-2xl overflow-hidden aspect-square shadow-sm hover:shadow-xl transition-all">
            <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/10 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/20 transition-colors"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
              <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1 transition-colors">Essential</span>
              <h3 className="text-lg font-medium text-black dark:text-gray-200 transition-colors">School</h3>
            </div>
          </Link>
          <Link to="/shop?category=Art And Craft" className="group relative rounded-2xl overflow-hidden aspect-square shadow-sm hover:shadow-xl transition-all">
            <div className="absolute inset-0 bg-purple-50 dark:bg-purple-900/10 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/20 transition-colors"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
              <span className="text-[10px] font-medium text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-1 transition-colors">Creative</span>
              <h3 className="text-lg font-medium text-black dark:text-gray-200 transition-colors">Art & Craft</h3>
            </div>
          </Link>
          <Link to="/shop?category=Office Supplies" className="group relative rounded-2xl overflow-hidden aspect-square shadow-sm hover:shadow-xl transition-all">
            <div className="absolute inset-0 bg-green-50 dark:bg-green-900/10 group-hover:bg-green-100 dark:group-hover:bg-green-900/20 transition-colors"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
              <span className="text-[10px] font-medium text-green-600 dark:text-green-400 uppercase tracking-widest mb-1 transition-colors">Professional</span>
              <h3 className="text-lg font-medium text-black dark:text-gray-200 transition-colors">Office</h3>
            </div>
          </Link>
          <Link to="/shop" className="group relative rounded-2xl overflow-hidden aspect-square shadow-sm hover:shadow-xl transition-all">
            <div className="absolute inset-0 bg-brand-50 dark:bg-brand-900/10 group-hover:bg-brand-100 dark:group-hover:bg-brand-900/20 transition-colors"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
              <span className="text-[10px] font-medium text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-1 transition-colors">Explore</span>
              <h3 className="text-lg font-medium text-black dark:text-gray-200 transition-colors">All Products</h3>
            </div>
          </Link>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-medium text-black dark:text-white transition-colors">
              Featured Collections
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Handpicked premium items for you</p>
          </div>
          <Link
            to="/shop"
            className="text-blue-600 dark:text-blue-400 font-medium text-xs uppercase tracking-wider hover:text-blue-700 dark:hover:text-blue-500 transition-colors flex items-center mt-3"
          >
            SEE EVERYTHING <ArrowRight className="h-3 w-3 ml-2" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl aspect-[3/4]"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>


      {/* OFFER SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="relative overflow-hidden rounded-[2.5rem] p-6 md:p-10 transition-all duration-500 shadow-xl bg-brand-600 text-white shadow-brand-900/10">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-brand-500 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-500 rounded-full blur-3xl opacity-30"></div>

          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <span className="inline-block px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest mb-4 bg-white/20 backdrop-blur-md text-white">Limited Time Offer</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight tracking-tight">
              Fresh Start For <br /> Your Dreams
            </h2>
            <p className="mb-8 text-base md:text-lg font-medium opacity-95 text-brand-50">
              Get up to <span className="text-white font-bold">40% OFF</span> on our curated executive bundles. Quality that inspires productivity.
            </p>
            <Link
              to="/shop"
              className="inline-block px-7 py-3 rounded-2xl font-bold text-base transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 bg-white text-brand-900"
            >
              Claim Your Discount
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
