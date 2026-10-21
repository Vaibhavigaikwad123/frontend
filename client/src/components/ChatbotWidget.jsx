import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Bot } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ChatbotWidget = () => {
    const { darkMode } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hi there! 👋 How can I help you with your stationery needs today?", sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMessage = { text: inputValue, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');

        // Simulate bot response
        setTimeout(() => {
            const inputLower = userMessage.text.toLowerCase();
            let botReply = "I'm sorry, I didn't understand that. Could you rephrase?";

            if (inputLower.includes('track') || inputLower.includes('order')) {
                botReply = "You can track your orders by going to your Profile and clicking 'Track Order' in your Order History.";
            } else if (inputLower.includes('return') || inputLower.includes('refund')) {
                botReply = "We offer a 7-day easy return policy. Go to your Profile > Order History and select 'Return / Exchange'.";
            } else if (inputLower.includes('shipping') || inputLower.includes('delivery')) {
                botReply = "Standard shipping usually takes 3-5 business days. We also offer free shipping on orders over ₹499.";
            } else if (inputLower.includes('hello') || inputLower.includes('hi')) {
                botReply = "Hello! How can I assist you with your shopping today?";
            } else if (inputLower.includes('coupon') || inputLower.includes('discount')) {
                botReply = "Make sure to subscribe to our newsletter at the bottom of the page to get a 10% off coupon code!";
            }

            setMessages(prev => [...prev, { text: botReply, sender: 'bot' }]);
        }, 1000);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
            {/* Chat Window */}
            <div className={`transition-all duration-300 transform origin-bottom-right ${isOpen ? 'scale-100 opacity-100 mb-4' : 'scale-0 opacity-0 h-0 w-0 overflow-hidden absolute'}`}>
                <div className={`w-[350px] h-[450px] shadow-2xl rounded-2xl flex flex-col border transition-colors ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>

                    {/* Header */}
                    <div className="bg-brand-600 text-white p-4 rounded-t-2xl flex justify-between items-center shadow-md">
                        <div className="flex items-center space-x-2">
                            <Bot className="h-6 w-6" />
                            <div>
                                <h3 className="font-bold text-sm">StationaryHub Support</h3>
                                <div className="flex items-center space-x-1">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    <span className="text-[10px] text-brand-100">Usually replies instantly</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-brand-700 p-1 rounded-full transition-colors">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex items-end space-x-2 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-brand-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                                        {msg.sender === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                                    </div>
                                    <div className={`px-4 py-2 ${msg.sender === 'user' ? 'bg-brand-600 text-white rounded-2xl rounded-br-sm' : `${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white border border-gray-200 text-gray-800'} rounded-2xl rounded-bl-sm shadow-sm`}`}>
                                        <p className="text-sm">{msg.text}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className={`p-3 border-t transition-colors ${darkMode ? 'border-gray-800 bg-gray-900 rounded-b-2xl' : 'border-gray-200 bg-white rounded-b-2xl'}`}>
                        <form onSubmit={handleSend} className="flex items-center space-x-2">
                            <input
                                type="text"
                                placeholder="Type your message..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className={`flex-1 px-4 py-2 rounded-full text-sm outline-none transition-colors border focus:border-brand-500 focus:ring-1 focus:ring-brand-500 ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-500'}`}
                            />
                            <button
                                type="submit"
                                disabled={!inputValue.trim()}
                                className={`p-2 rounded-full bg-brand-600 text-white transition-all transform ${!inputValue.trim() ? 'opacity-50 cursor-not-allowed scale-95' : 'hover:bg-brand-700 hover:scale-105 active:scale-95'}`}
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 bg-brand-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 z-50 ${isOpen ? 'rotate-90 scale-0 opacity-0 absolute' : 'rotate-0 scale-100 opacity-100'}`}
            >
                <MessageCircle className="h-6 w-6" />
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
            </button>
        </div>
    );
};

export default ChatbotWidget;
