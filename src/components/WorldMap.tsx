import React, { useEffect, useState, useRef } from 'react';
import { Link } from "react-router-dom";
// @ts-ignore
import Globe from 'react-globe.gl';
import Footer from "./Footer";

export default function WorldMap() {
  const globeEl = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [countries, setCountries] = useState({ features: [] });
  const [cities, setCities] = useState<any[]>([]);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isClient, setIsClient] = useState(false);
  const [isRotating, setIsRotating] = useState(true);
  const [showCities, setShowCities] = useState(true);

  // Initialize client and fetch data
  useEffect(() => {
    setIsClient(true);
    
    // Country Polygons
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(setCountries)
      .catch(err => console.error("Failed to load globe data", err));

    // Populated Places (Cities)
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_populated_places_simple.geojson')
      .then(res => res.json())
      .then(data => {
        const sortedFeatures = data.features.sort((a: any, b: any) => b.properties.POP_MAX - a.properties.POP_MAX);
        setCities(sortedFeatures);
      })
      .catch(err => console.error("Failed to load city data", err));
  }, []);

  // Handle Container Resizing
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Configure Globe on mount
  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.pointOfView({ altitude: 2.5 }, 0);
      const controls = globeEl.current.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
    }
  }, [isClient]);

  const toggleRotation = () => {
    if (globeEl.current) {
      const controls = globeEl.current.controls();
      controls.autoRotate = !controls.autoRotate;
      setIsRotating(controls.autoRotate);
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (globeEl.current) {
      const currentAlt = globeEl.current.pointOfView().altitude;
      const newAlt = direction === 'in' ? Math.max(0.2, currentAlt - 0.5) : Math.min(4, currentAlt + 0.5);
      globeEl.current.pointOfView({ altitude: newAlt }, 400);
    }
  };

  const handleReset = () => {
    if (globeEl.current) globeEl.current.pointOfView({ lat: 0, lng: 0, altitude: 2.5 }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4 bg-slate-900 font-sans text-slate-100 selection:bg-indigo-500">
      <h1 className="text-3xl font-bold mb-6 text-white tracking-tight flex items-center gap-3">
        <span>🌍</span> 3D Global Visualization
      </h1>

      <div className="flex gap-4 mb-6 z-10">
        <Link to="/" className="px-5 py-2.5 bg-slate-800 text-slate-200 border border-slate-700 rounded-lg shadow-sm hover:bg-slate-700 transition-all flex items-center gap-2">
          <span>←</span> Back to Home
        </Link>
      </div>

      <div ref={containerRef} className="w-full max-w-6xl h-[70vh] bg-slate-950 rounded-xl shadow-2xl border border-slate-800 overflow-hidden relative">
        {isClient && (
          <Globe
            ref={globeEl}
            width={dimensions.width}
            height={dimensions.height}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
            backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
            polygonsData={countries.features}
            polygonAltitude={0.06}
            polygonCapColor={() => 'rgba(200, 200, 200, 0.1)'}
            polygonSideColor={() => 'rgba(255, 255, 255, 0.05)'}
            pointsData={showCities ? cities : []}
            pointColor={() => '#fbbf24'}
            pointAltitude={0.07}
            pointRadius={0.35}
            atmosphereColor="#3b82f6"
            atmosphereAltitude={0.15}
          />
        )}
        
        {/* Consolidated High-Performance Control Overlay */}
        <div className="absolute top-6 right-6 flex flex-col gap-3 z-20 transition-opacity duration-300 opacity-90 hover:opacity-100 items-end">
            <button 
              aria-label={isRotating ? "Pause Rotation" : "Start Rotation"}
              onClick={toggleRotation}
              className="flex items-center gap-2 px-3 py-2.5 bg-slate-800/80 backdrop-blur hover:bg-indigo-600 text-white rounded-lg border border-slate-700 transition-all shadow-lg font-medium text-sm"
            >
               {isRotating ? (
                 <>
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                   <span>Pause</span>
                 </>
               ) : (
                 <>
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                   <span>Rotate</span>
                 </>
               )}
            </button>
            
            <div className="flex flex-col bg-slate-800/80 backdrop-blur rounded-lg border border-slate-700 overflow-hidden shadow-lg w-10">
                <button 
                  aria-label="Zoom In"
                  onClick={() => handleZoom('in')}
                  className="p-2.5 hover:bg-slate-700 text-slate-200 border-b border-slate-700/50 transition-colors flex justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                </button>
                <button 
                  aria-label="Zoom Out"
                  onClick={() => handleZoom('out')}
                  className="p-2.5 hover:bg-slate-700 text-slate-200 transition-colors flex justify-center"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                </button>
            </div>
            
            <button 
              aria-label={showCities ? "Hide Cities" : "Show Cities"}
              onClick={() => setShowCities(!showCities)}
              className={`p-2.5 backdrop-blur rounded-lg border border-slate-700 transition-colors shadow-lg w-10 flex justify-center ${showCities ? 'bg-indigo-600/80 text-white' : 'bg-slate-800/80 text-slate-400 hover:text-white'}`}
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4 8 4v14"/><path d="M17 21v-8.66a2 2 0 0 0-1.44-1.91l-2.4-1.2a2 2 0 0 0-1.8 0l-2.4 1.2A2 2 0 0 0 7.56 12.34V21"/></svg>
            </button>

            <button 
              aria-label="Reset View"
              onClick={handleReset}
              className="p-2.5 bg-slate-800/80 backdrop-blur hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors shadow-lg w-10 flex justify-center"
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
            </button>
        </div>

        {/* Optional Loading Skeletons can be added here */}
        {countries.features.length === 0 && (
           <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm z-30">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div>
           </div>
        )}
      </div>

      <div className="mt-auto w-full pt-10">
        <Footer />
      </div>
    </div>
  );
}