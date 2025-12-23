import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import Footer from "./Footer";
import { fetchCountryStats, fetchCityStats } from '../services/geminiService';
import { CountryData, CityData } from '../types';

export default function Details() {
  const [showCopied, setShowCopied] = useState(false);
  const [countryStats, setCountryStats] = useState<CountryData[]>([]);
  const [cityStats, setCityStats] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [countries, cities] = await Promise.all([
          fetchCountryStats(),
          fetchCityStats()
        ]);
        setCountryStats(countries);
        setCityStats(cities);
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleShare = async () => {
    const url = "https://www.worldometers.info/world-population/";
    const shareData = {
      title: 'World Population Stats',
      text: 'Check out these detailed world population statistics!',
      url: url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.debug('Share cancelled or failed', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy', err);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4 bg-slate-50 font-sans">
      <h1 className="text-3xl font-bold mb-6 text-slate-900 tracking-tight">🌍 Detailed Population Stats</h1>

      <div className="flex gap-4 mb-6">
        <Link
          to="/"
          className="px-5 py-2.5 bg-white text-slate-700 font-medium border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
        >
          <span>←</span> Back to Home
        </Link>

        <button
          onClick={handleShare}
          className="relative px-5 py-2.5 bg-indigo-600 text-white font-medium border border-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
          
          {showCopied && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-semibold py-1.5 px-3 rounded shadow-lg animate-slide-up whitespace-nowrap z-50">
              Link Copied!
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
            </div>
          )}
        </button>
      </div>

      <div className="w-full max-w-5xl h-[50vh] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden relative mb-12">
        <iframe
          src="https://www.worldometers.info/world-population/"
          className="w-full h-full border-none"
          loading="lazy"
          title="World Population Statistics"
        />
      </div>

      {/* Country Statistics Section */}
      <div className="w-full max-w-5xl mb-12">
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Top 20 Populous Nations</h2>
              <p className="text-slate-500 text-sm mt-1">AI-Curated real-time estimates</p>
            </div>
            <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-indigo-600 font-bold text-xs">AI</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4 text-center w-16">Rank</th>
                  <th className="px-6 py-4">Country</th>
                  <th className="px-6 py-4 text-right">Population</th>
                  <th className="px-6 py-4 text-right">Annual Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  // Loading Skeleton Rows
                  [...Array(10)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4 text-center"><div className="h-4 w-4 bg-slate-200 rounded mx-auto"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-200 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 rounded ml-auto"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-200 rounded ml-auto"></div></td>
                    </tr>
                  ))
                ) : (
                  countryStats.map((stat) => (
                    <tr key={stat.rank} className="hover:bg-indigo-50/30 transition-colors duration-150">
                      <td className="px-6 py-4 text-center font-bold text-slate-400">
                        {stat.rank}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {stat.country}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-slate-700">
                        {stat.population}
                      </td>
                      <td className={`px-6 py-4 text-right font-medium ${stat.growthRate.includes('-') ? 'text-red-500' : 'text-emerald-600'}`}>
                        {stat.growthRate}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* City Statistics Section */}
      <div className="w-full max-w-5xl mb-12">
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Top 20 Largest Cities</h2>
              <p className="text-slate-500 text-sm mt-1">Metro area population estimates</p>
            </div>
            <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center">
              <span className="text-amber-600 font-bold text-xs">AI</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4 text-center w-16">Rank</th>
                  <th className="px-6 py-4">City</th>
                  <th className="px-6 py-4">Country</th>
                  <th className="px-6 py-4 text-right">Population</th>
                  <th className="px-6 py-4 w-1/3">Insight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  // Loading Skeleton Rows
                  [...Array(10)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4 text-center"><div className="h-4 w-4 bg-slate-200 rounded mx-auto"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-200 rounded ml-auto"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-full bg-slate-200 rounded"></div></td>
                    </tr>
                  ))
                ) : (
                  cityStats.map((stat) => (
                    <tr key={stat.rank} className="hover:bg-amber-50/30 transition-colors duration-150">
                      <td className="px-6 py-4 text-center font-bold text-slate-400">
                        {stat.rank}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {stat.city}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {stat.country}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-slate-700 font-medium">
                        {stat.population}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 leading-relaxed italic">
                        "{stat.description}"
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
           {!loading && (
             <div className="bg-slate-50 px-6 py-3 text-right border-t border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">Powered by Gemini 2.5 Flash</span>
             </div>
          )}
        </div>
      </div>

      <div className="w-full">
        <Footer />
      </div>
    </div>
  );
}