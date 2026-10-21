const About = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-6 text-gray-900">About Stationery Shop</h1>

                <div className="prose prose-lg max-w-none">
                    <p className="text-xl text-gray-600 mb-8">
                        Your one-stop destination for all stationery needs - from school supplies to premium office essentials.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">Our Story</h2>
                    <p className="text-gray-700 mb-6">
                        Founded in 2025, Stationery Shop was born from a simple idea: to make quality stationery accessible to everyone. We believe that the right tools can inspire creativity, boost productivity, and make learning enjoyable.
                    </p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">What We Offer</h2>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
                        <li>Wide range of school supplies for students of all ages</li>
                        <li>Premium art and craft materials for creative minds</li>
                        <li>Professional office stationery for businesses</li>
                        <li>Authentic products from trusted brands</li>
                        <li>Competitive prices with fast delivery</li>
                    </ul>

                    <h2 className="text-2xl font-bold mt-8 mb-4">Our Commitment</h2>
                    <p className="text-gray-700 mb-6">
                        We are committed to providing excellent customer service, genuine products, and a seamless shopping experience. Your satisfaction is our priority.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default About;
