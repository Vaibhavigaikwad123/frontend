import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MessageCircle } from 'lucide-react';

const Contact = () => {
    const navigate = useNavigate();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold mb-6 text-gray-900">Contact Us</h1>
                <p className="text-gray-600 mb-12">Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="text-center p-6 bg-white rounded-lg shadow">
                        <Mail className="h-8 w-8 mx-auto text-brand-600 mb-4" />
                        <h3 className="font-semibold mb-2">Email</h3>
                        <p className="text-sm text-gray-600">StationaryHub@gmail.com</p>
                    </div>
                    <div className="text-center p-6 bg-white rounded-lg shadow">
                        <Phone className="h-8 w-8 mx-auto text-brand-600 mb-4" />
                        <h3 className="font-semibold mb-2">Phone</h3>
                        <p className="text-sm text-gray-600">+91 98765 43210</p>
                    </div>
                    <div className="text-center p-6 bg-white rounded-lg shadow">
                        <MessageCircle className="h-8 w-8 mx-auto text-brand-600 mb-4" />
                        <h3 className="font-semibold mb-2">WhatsApp</h3>
                        <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="text-sm text-brand-600 hover:underline">Chat with us</a>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-8">
                    <h2 className="text-2xl font-bold mb-6">Business Hours</h2>
                    <div className="space-y-2 text-gray-600">
                        <p><span className="font-semibold text-gray-900">Monday - Friday:</span> 9:00 AM - 10:00 PM</p>
                        <p><span className="font-semibold text-gray-900">Saturday:</span> 10:00 AM - 6:00 PM</p>
                        <p><span className="font-semibold text-gray-900">Sunday:</span> Closed</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
