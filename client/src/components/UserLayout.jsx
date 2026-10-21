import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ChatbotWidget from './ChatbotWidget';

const UserLayout = () => {
    return (
        <div className="flex flex-col min-h-screen bg-transparent transition-colors duration-300">
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
            <ChatbotWidget />
        </div>
    );
};

export default UserLayout;

