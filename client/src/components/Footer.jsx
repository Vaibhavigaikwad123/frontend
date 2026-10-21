import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';

const Footer = () => {
    const { darkMode } = useTheme();
    const { addToast } = useToast();
    const [email, setEmail] = useState('');

    const handleNewsletterSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/newsletter/subscribe', { email });
            addToast(res.data.message || 'Subscribed successfully! Check your email for your 10% discount code.', 'success');
            setEmail('');
        } catch (err) {
            addToast(err.response?.data?.message || 'Error subscribing to newsletter', 'error');
        }
    };

    return (
        <footer className={`pt-10 pb-6 transition-colors duration-300 ${darkMode ? 'bg-gray-950 text-white' : 'bg-white text-black border-t border-gray-100'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Newsletter Section */}
                <div className={`mb-12 p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between transition-colors ${darkMode ? 'bg-brand-900/10 border border-brand-800' : 'bg-brand-50 border border-brand-100'}`}>
                    <div className="mb-6 md:mb-0 md:mr-8 max-w-lg text-center md:text-left">
                        <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Subscribe to our Newsletter</h3>
                        <p className={`text-sm ${darkMode ? 'text-brand-300' : 'text-brand-700'}`}>Get <span className="font-bold border-b border-brand-500">10% off</span> your first order and stay updated with the latest stationery trends.</p>
                    </div>
                    <form onSubmit={handleNewsletterSubmit} className="flex w-full max-w-md shadow-sm">
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={`flex-[3] px-4 py-3 rounded-l-xl outline-none transition-colors border-y border-l text-sm sm:text-base ${darkMode ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-brand-500' : 'bg-white border-gray-200 placeholder-gray-400 focus:border-brand-500'}`}
                        />
                        <button
                            type="submit"
                            className="flex-[1] bg-brand-600 text-white px-4 py-3 rounded-r-xl font-bold hover:bg-brand-700 transition-colors whitespace-nowrap text-sm sm:text-base border-y border-r border-transparent"
                        >
                            Subscribe
                        </button>
                    </form>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">
                            <span className="text-brand-600 dark:text-brand-400">Stationary</span>
                            <span className="text-brand-500 dark:text-brand-300">Hub</span>
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Your house of premium stationery. Premium quality at affordable prices for school, office, and art.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Quick Links</h4>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li><Link to="/shop" className="hover:text-brand-600 dark:hover:text-white transition-colors">Shop All</Link></li>
                            <li><Link to="/shop?featured=true" className="hover:text-brand-600 dark:hover:text-white transition-colors">Featured Products</Link></li>
                            <li><Link to="/about" className="hover:text-brand-600 dark:hover:text-white transition-colors">About Us</Link></li>
                            <li><Link to="/contact" className="hover:text-brand-600 dark:hover:text-white transition-colors">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Customer Support</h4>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li><Link to="/contact" className="hover:text-brand-600 dark:hover:text-white transition-colors">Contact Us</Link></li>
                            <li><Link to="/terms" className="hover:text-brand-600 dark:hover:text-white transition-colors">Terms & Conditions</Link></li>
                            <li><Link to="/terms" className="hover:text-brand-600 dark:hover:text-white transition-colors">Shipping Policy</Link></li>
                            <li><Link to="/terms" className="hover:text-brand-600 dark:hover:text-white transition-colors">Returns & Refunds</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Contact</h4>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li>RadhaSwami Apartment Datta Chowak,Badlapur, India</li>
                            <li>Email:StationaryHub@gmail.com</li>
                            <li>Phone: +91 98765 43210</li>
                        </ul>
                    </div>
                </div>
                <div className={`mt-8 pt-6 text-center text-sm transition-colors ${darkMode ? 'border-gray-900 text-gray-500' : 'border-gray-100 text-gray-500'}`}>
                    &copy; {new Date().getFullYear()} StationaryHub. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
