import React from 'react';
import { Link } from "react-router-dom";
import LivePopulation from "./LivePopulation";
import Footer from "./Footer";
import GeminiFact from "./GeminiFact";

// Image optimization: Using a direct URL and ensuring we use the WebP version
const HERO_IMAGE_URL = "/people.webp";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-slate-950 selection:bg-indigo-500 selection:text-white">
      {/* ... (Background elements remain the same) */}

      <nav className="w-full p-6 flex justify-between items-center relative z-10 border-b border-white/5 bg-slate-900/30 backdrop-blur-sm">
        <div className="font-bold text-xl tracking-tight text-white flex items-center gap-3">
          <img
            src="/logo.webp"
            alt="PopSync Logo"
            width="36" // Set explicit width to prevent layout shift
            height="36" // Set explicit height to prevent layout shift
            loading="lazy" // Defer loading as it's not the main LCP element
            className="w-9 h-9 rounded-lg shadow-lg shadow-indigo-500/20 object-contain"
          />
          <span className="font-display tracking-tight text-slate-100">PopSync</span>
        </div>
        <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
          TWA in progress
        </button>
      </nav>

      <main className="flex-grow flex flex-col items-center justify-center px-4 py-12 relative z-10 w-full max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between w-full gap-12 lg:gap-20">
            
            {/* Left Column: Visual/Image */}
            <div className="w-full md:w-1/2 flex justify-center md:justify-end order-1 md:order-1 relative">
                <div className="relative group w-64 h-64 md:w-[400px] md:h-[400px] animate-float">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full blur-[60px] opacity-20 transition duration-1000"></div>
                    
                    <div className="relative w-full h-full rounded-full p-2 border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl">
                        <img 
                            src={HERO_IMAGE_URL} 
                            alt="World Population Collage"
                            width="400" // Optimization: Match display width
                            height="400" // Optimization: Match display height
                            fetchpriority="high" // Critical for LCP improvement
                            loading="eager" // Load immediately
                            className="w-full h-full object-cover rounded-full shadow-inner opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                        />
                        <div className="absolute inset-0 rounded-full border border-white/10 scale-110 pointer-events-none"></div>
                        <div className="absolute inset-0 rounded-full border border-indigo-500/20 scale-125 border-dashed animate-spin-slow pointer-events-none"></div>
                    </div>
                </div>
            </div>

            {/* Right Column: Stats & Actions */}
            <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left order-2 md:order-2">
                <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/30 border border-indigo-700/50 text-indigo-300 text-xs font-semibold uppercase tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                    Real-time Data
                </div>
                
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 mb-8 tracking-tight leading-tight">
                    Humanity <br/> in Motion
                </h1>
                
                <div className="w-full mb-8">
                     <LivePopulation />
                </div>

                <div className="w-full max-w-md">
                     <GeminiFact />
                </div>
               <div className="mt-10 flex flex-col sm:flex-row flex-wrap gap-4 w-full max-w-sm md:max-w-none justify-center md:justify-start">
                    <Link
                    to="/details"
                    className="group relative inline-flex items-center justify-center px-6 py-3.5 text-sm font-bold text-white transition-all duration-200 bg-indigo-600 rounded-full hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 focus:ring-offset-slate-900 shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-1"
                    >
                        <span>Analyze Stats</span>
                        <svg className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                    
                    <Link 
                        to="/map"
                        className="group inline-flex items-center justify-center px-6 py-3.5 text-sm font-bold text-slate-300 bg-transparent border border-slate-700 rounded-full hover:bg-slate-800 hover:text-white hover:border-slate-600 transition-all duration-200"
                    >
                        <span>3D Map</span>
                    </Link>

                    <Link 
                        to="/quiz"
                        className="group inline-flex items-center justify-center px-6 py-3.5 text-sm font-bold text-slate-300 bg-slate-800/50 border border-slate-700 rounded-full hover:bg-emerald-600/20 hover:text-emerald-400 hover:border-emerald-500/50 transition-all duration-200"
                    >
                        <span>✨ Quiz</span>
                    </Link>
                </div>
            </div>

           
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Home;