import React, { useEffect, useState } from 'react';
import { fetchPopulationInsight } from '../services/geminiService';
import { PopulationFact } from '../../types';

const GeminiFact: React.FC = () => {
  const [insight, setInsight] = useState<PopulationFact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFact = async () => {
      try {
        const data = await fetchPopulationInsight();
        setInsight(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadFact();
  }, []);

  if (loading) return <div className="h-20 w-full bg-slate-800/50 animate-pulse rounded-xl mt-6 border border-slate-700/50"></div>;
  if (!insight) return null;

  return (
    <div className="mt-6 w-full bg-slate-800/40 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-lg relative overflow-hidden group hover:bg-slate-800/60 transition-colors">
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
      <div className="flex items-start gap-4">
        <div className="bg-indigo-500/10 p-2 rounded-lg shrink-0 border border-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        </div>
        <div>
            <p className="text-sm md:text-base text-slate-200 font-medium leading-relaxed">"{insight.fact}"</p>
            <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] text-indigo-300 uppercase tracking-wider font-bold">AI Insight</span>
                {/* ACCESSIBILITY FIX: Using text-slate-400 for better contrast */}
                <span className="text-[10px] text-slate-400">•</span>
                {/* ACCESSIBILITY FIX: Using text-slate-300 for contrast compliance */}
                <span className="text-[10px] text-slate-300">{insight.source}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default GeminiFact;