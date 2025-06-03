// frontend/src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

function HomePage() {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
            {/* Header/Navigation Bar */}
            <header className="w-full bg-white shadow-sm py-4 px-6 md:px-10">
                <nav className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        {/* You can replace this with a logo image */}
                        <svg className="h-8 w-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-8-8a8 8 0 0116 0h-2A6 6 0 0010 4V2a8 8 0 00-8 8z" clipRule="evenodd" />
                        </svg>
                        <span className="text-2xl font-bold text-gray-900">Daily Test System</span>
                    </div>
                    <div className="space-x-4">
                        <Link to="/admin/login">
                            <Button className="px-4 py-2 rounded-md font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200">
                                Admin Login
                            </Button>
                        </Link>
                        <Link to="/worker/login">
                            <Button className="px-4 py-2 rounded-md font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200">
                                Worker Login
                            </Button>
                        </Link>
                    </div>
                </nav>
            </header>

            {/* Hero Section */}
            <main className="flex-grow flex items-center justify-center p-6 md:p-10 bg-gradient-to-br from-blue-50 to-indigo-100 text-center">
                <div className="max-w-4xl mx-auto py-16">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-4 animate-fade-in-down">
                        Elevate Your Workforce's Knowledge
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto animate-fade-in-up">
                        Streamline skill assessment and track progress with our intuitive daily testing platform.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <Link to="/worker/login">
                            <Button className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg text-xl font-semibold shadow-md hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-75">
                                Start Your Test
                            </Button>
                        </Link>
                        <Link to="/scoreboard">
                            <Button className="w-full sm:w-auto px-8 py-3 border border-gray-300 bg-white text-gray-800 rounded-lg text-xl font-semibold shadow-md hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-gray-300 focus:ring-opacity-75">
                                View Scoreboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </main>

            {/* Features/About Section - Simple Placeholder */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-10">Why Choose Daily Test System?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                            <svg className="h-10 w-10 text-green-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <h3 className="text-xl font-semibold mb-2">Automated Assessments</h3>
                            <p className="text-gray-600">Quickly generate and deploy tests, saving valuable time.</p>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                            <svg className="h-10 w-10 text-purple-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                            </svg>
                            <h3 className="text-xl font-semibold mb-2">Performance Tracking</h3>
                            <p className="text-gray-600">Monitor individual and department scores with detailed analytics.</p>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                            <svg className="h-10 w-10 text-yellow-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v2.102a1 1 0 01-.836.985l-7.374 1.748A1 1 0 013 7v10a1 1 0 001 1h12a1 1 0 001-1V9a1 1 0 00-1-1h-1.054l-.772-1.545A1 1 0 0114 5h-3.146l-.836-1.672a1 1 0 00-.518-.323zM10.748 15.328a1 1 0 11-1.496-1.328 3 3 0 10-2.434-2.434 1 1 0 01-1.328-1.496 5 5 0 116.292 6.292z" clipRule="evenodd" />
                            </svg>
                            <h3 className="text-xl font-semibold mb-2">AI-Powered Questions</h3>
                            <p className="text-gray-600">Generate diverse and relevant questions using advanced AI.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="w-full bg-gray-900 text-white py-8 px-6 md:px-10">
                <div className="container mx-auto text-center text-sm">
                    <p>&copy; {new Date().getFullYear()} Daily Test System. All rights reserved.</p>
                    <p className="mt-2">
                        <Link to="/privacy-policy" className="hover:underline mx-2">Privacy Policy</Link>
                        <Link to="/terms-of-service" className="hover:underline mx-2">Terms of Service</Link>
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default HomePage;