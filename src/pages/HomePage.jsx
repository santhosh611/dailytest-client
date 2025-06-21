import React from 'react';
import { Link } from 'react-router-dom';
// Use your logo path
import logo from '../assets/images/tech logo.jpeg';

function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Nav */}
      <header className="w-full">
        <div className="flex items-center justify-between px-8 py-4 border-b border-gray-200">
          {/* Logo + Brand */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="w-8 h-8" />
            <span className="font-bold text-2xl text-gray-800 tracking-tight">Tech vaseegrah</span>
          </div>
          {/* (Optional: Add nav links here if you want in future) */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <div className="flex flex-col items-center justify-center mt-10">
          {/* Center mark/logo (optional, can use a different/mini logo) */}
        
          <div className="text-xl text-gray-700 mb-2">Hi, welcome!</div>
          <h1 className="font-black text-5xl sm:text-6xl text-gray-900 leading-tight mb-4">
            Your{' '}
            <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
              Daily
            </span>
            <br />
            Dose of Learning and Growth
          </h1>
          <p className="text-lg text-gray-500 mb-8 max-w-xl">
            Test smarter, not harder.
          </p>
          <Link to="/worker/login">
            <button
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-400 text-white text-xl font-semibold rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200"
            >
              Start your daily test
            </button>
          </Link>
          <div className="flex flex-wrap justify-center gap-4 mt-7">
            <Link to="/admin/login" className="inline-block">
              <button className="px-7 py-2 text-base font-medium rounded-full bg-gray-100 text-blue-700 border border-blue-100 hover:bg-blue-50 transition">
                Admin access
              </button>
            </Link>
            <Link to="/scoreboard" className="inline-block">
              <button className="px-7 py-2 text-base font-medium rounded-full bg-gray-100 text-yellow-700 border border-yellow-100 hover:bg-yellow-50 transition">
                View rankings
              </button>
            </Link>
          </div>
        </div>
      </main>
      {/* No footer */}
      <style>{`
        body { background: #fff; }
      `}</style>
    </div>
  );
}

export default HomePage;
