import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Link } from "react-router-dom";
// @ts-ignore
import Globe from 'react-globe.gl';
import Footer from "./Footer";

export default function WorldMap() {
  // Fix: Initialize useRef with null to satisfy argument requirement
  const globeEl = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [countries, setCountries] = useState({ features: [] });
  const [cities, setCities] = useState<any[]>([]);
  const [hoverD, setHoverD] = useState<any | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isClient, setIsClient] = useState(false);
  const [isRotating, setIsRotating] = useState(true);
  const [showCities, setShowCities] = useState(true);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    setIsClient(true);
    
    // Load GeoJSON for countries
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(setCountries)
      .catch(err => console.error("Failed to load globe data", err));

    // Load GeoJSON for cities
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_populated_places_simple.geojson')
      .then(res => res.json())
      .then(data => {
        // Sort by population to ensure larger cities render on top if overlapping (though pointsMerge handles visual aggregation)
        const sortedFeatures = data.features.sort((a: any, b: any) => b.properties.POP_MAX - a.properties.POP_MAX);
        setCities(sortedFeatures);
      })
      .catch(err => console.error("Failed to load city data", err));
  }, []);

  useEffect(() => {
    // Resize observer to make the globe responsive to its container
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    // Set initial point of view
    if (globeEl.current) {
      globeEl.current.pointOfView({ altitude: 2.5 }, 0);
      // Auto-rotate configuration
      const controls = globeEl.current.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
    }
  }, [isClient]);

  // Search Filter Logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    // @ts-ignore
    const filtered = countries.features.filter((f: any) => 
      f.properties.ADMIN.toLowerCase().includes(query) || 
      f.properties.ISO_A3.toLowerCase().includes(query)
    ).slice(0, 5); // Limit to top 5 results

    setSearchResults(filtered);
  }, [searchQuery, countries]);

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
      // Define limits: min 0.1 (very close), max 4 (far)
      const newAlt = direction === 'in' 
        ? Math.max(0.2, currentAlt - 0.5) 
        : Math.min(4, currentAlt + 0.5);
      
      globeEl.current.pointOfView({ altitude: newAlt }, 400);
    }
  };

  const handleReset = () => {
    if (globeEl.current) {
      globeEl.current.pointOfView({ lat: 0, lng: 0, altitude: 2.5 }, 1000);
    }
  };

  // GeoJSON Centroid Helper
  const getGeoCentroid = (feature: any) => {
    let minLng = 180, maxLng = -180, minLat = 90, maxLat = -90;

    const updateBounds = (coords: any[]) => {
       coords.forEach(c => { // c is [lng, lat]
          const [lng, lat] = c;
          if (lng < minLng) minLng = lng;
          if (lng > maxLng) maxLng = lng;
          if (lat < minLat) minLat = lat;
          if (lat > maxLat) maxLat = lat;
       });
    };

    // Helper to find the largest ring in a multipolygon (usually mainland) to avoid centering in ocean
    const findLargestRing = (polygons: any[]) => {
        let maxLen = 0;
        let largestRing = polygons[0][0]; // Default to first ring of first poly
        
        polygons.forEach(poly => {
            // poly is array of rings, ring 0 is exterior
            const ring = poly[0]; 
            if (ring.length > maxLen) {
                maxLen = ring.length;
                largestRing = ring;
            }
        });
        return largestRing;
    }

    if (feature.geometry.type === 'Polygon') {
       // Polygon is array of rings. Ring 0 is the outer boundary.
       updateBounds(feature.geometry.coordinates[0]);
    } else if (feature.geometry.type === 'MultiPolygon') {
       // MultiPolygon is array of Polygons.
       const largestRing = findLargestRing(feature.geometry.coordinates);
       updateBounds(largestRing);
    }

    return {
       lat: (minLat + maxLat) / 2,
       lng: (minLng + maxLng) / 2
    };
  };

  const handleSelectCountry = (feature: any) => {
    const { lat, lng } = getGeoCentroid(feature);
    
    if (globeEl.current) {
      // Stop rotation when user searches to focus
      if (isRotating) {
         const controls = globeEl.current.controls();
         controls.autoRotate = false;
         setIsRotating(false);
      }
      
      globeEl.current.pointOfView({ lat, lng, altitude: 1.5 }, 1500);
    }

    setHoverD(feature);
    setSearchQuery("");
    setSearchResults([]);
  };

  const getTooltipContent = (d: any) => {
    const pop = d.properties.POP_EST;
    const formattedPop = pop 
      ? new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(pop) 
      : 'N/A';

    return `
      <div style="background: rgba(15, 23, 42, 0.95); color: white; border-radius: 12px; padding: 14px 18px; font-family: 'Inter', sans-serif; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6); border: 1px solid rgba(56, 189, 248, 0.4); backdrop-filter: blur(12px); min-width: 180px;">
        <div style="font-weight: 800; font-size: 20px; margin-bottom: 8px; color: #38bdf8; letter-spacing: -0.025em; line-height: 1.1;">${d.properties.ADMIN}</div>
        <div style="width: 100%; height: 1px; background: rgba(255,255,255,0.15); margin-bottom: 10px;"></div>
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; font-size: 13px;">
           <span style="color: #cbd5e1; font-weight: 500;">EST. POPULATION</span>
           <span style="color: #fff; font-weight: 700; font-family: 'JetBrains Mono', monospace;">${formattedPop}</span>
        </div>
        <div style="font-size: 10px; color: #64748b; margin-top: 8px; text-transform: uppercase; letter-spacing: 0.05em; text-align: right;">
           ISO: ${d.properties.ISO_A3}
        </div>
      </div>
    `;
  };

  const getCityTooltip = (d: any) => {
    const pop = d.properties.POP_MAX;
    const formattedPop = pop 
      ? new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(pop) 
      : 'N/A';

    return `
      <div style="background: rgba(15, 23, 42, 0.95); color: white; border-radius: 8px; padding: 10px 14px; font-family: 'Inter', sans-serif; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); border: 1px solid rgba(250, 204, 21, 0.3); backdrop-filter: blur(4px);">
        <div style="font-weight: 700; font-size: 15px; margin-bottom: 4px; color: #facc15;">${d.properties.NAME}</div>
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 12px;">
           <span style="color: #94a3b8; font-weight: 500;">POPULATION</span>
           <span style="color: #fef08a; font-weight: 700; font-family: 'JetBrains Mono', monospace;">${formattedPop}</span>
        </div>
      </div>
    `;
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4 bg-slate-900 font-sans text-slate-100 selection:bg-indigo-500 selection:text-white">
      <h1 className="text-3xl font-bold mb-6 text-white tracking-tight flex items-center gap-3">
        <span>🌍</span> 3D Global Visualization
      </h1>

      <div className="flex gap-4 mb-6 z-10">
        <Link
          to="/"
          className="px-5 py-2.5 bg-slate-800 text-slate-200 font-medium border border-slate-700 rounded-lg shadow-sm hover:bg-slate-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
        >
          <span>←</span> Back to Home
        </Link>
      </div>

      <div 
        ref={containerRef}
        className="w-full max-w-6xl h-[70vh] bg-slate-950 rounded-xl shadow-2xl shadow-indigo-900/20 border border-slate-800 overflow-hidden relative group"
      >
        {/* Search Bar Overlay */}
        <div className="absolute top-6 left-6 z-20 w-64 md:w-72">
           <div className="relative group/search">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <svg className="h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                 </svg>
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country..." 
                className="block w-full pl-10 pr-3 py-2.5 bg-slate-800/80 backdrop-blur border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-lg transition-all"
              />
              {/* Dropdown Results */}
              {searchQuery && searchResults.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-slate-800/95 backdrop-blur border border-slate-700 rounded-lg shadow-xl overflow-hidden animate-slide-up">
                   {searchResults.map((feature: any) => (
                      <button
                        key={feature.properties.ISO_A3}
                        onClick={() => handleSelectCountry(feature)}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-indigo-600/30 hover:text-white transition-colors border-b border-slate-700/50 last:border-0 flex items-center justify-between group/item"
                      >
                         <span>{feature.properties.ADMIN}</span>
                         <span className="opacity-0 group-hover/item:opacity-100 text-xs text-indigo-400 transition-opacity">Go</span>
                      </button>
                   ))}
                </div>
              )}
           </div>
        </div>

        {isClient && (
          <Globe
            ref={globeEl}
            width={dimensions.width}
            height={dimensions.height}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
            backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
            
            polygonsData={countries.features}
            polygonAltitude={d => d === hoverD ? 0.12 : 0.06}
            polygonCapColor={d => d === hoverD ? 'rgba(56, 189, 248, 0.9)' : 'rgba(200, 200, 200, 0.1)'}
            polygonSideColor={(d: any) => d === hoverD ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255, 255, 255, 0.05)'}
            polygonStrokeColor={(d: any) => d === hoverD ? '#ffffff' : '#111'}
            polygonLabel={getTooltipContent}
            onPolygonHover={setHoverD}
            polygonsTransitionDuration={300}

            pointsData={showCities ? cities : []}
            pointLat={(d: any) => d.geometry.coordinates[1]}
            pointLng={(d: any) => d.geometry.coordinates[0]}
            pointColor={() => '#fbbf24'}
            pointAltitude={0.07}
            pointRadius={0.35}
            pointResolution={2}
            pointLabel={getCityTooltip}
            
            atmosphereColor="#3b82f6"
            atmosphereAltitude={0.15}
          />
        )}
        
        {/* Controls Overlay */}
        <div className="absolute top-6 right-6 flex flex-col gap-3 z-20 transition-opacity duration-300 opacity-90 hover:opacity-100 items-end">
            <button 
              onClick={toggleRotation}
              className="flex items-center gap-2 px-3 py-2.5 bg-slate-800/80 backdrop-blur hover:bg-indigo-600 text-white rounded-lg border border-slate-700 transition-all shadow-lg font-medium text-sm"
              title={isRotating ? "Pause Rotation" : "Start Rotation"}
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
                  onClick={() => handleZoom('in')}
                  className="p-2.5 hover:bg-slate-700 text-slate-200 border-b border-slate-700/50 transition-colors flex justify-center"
                  title="Zoom In"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                </button>
                <button 
                  onClick={() => handleZoom('out')}
                  className="p-2.5 hover:bg-slate-700 text-slate-200 transition-colors flex justify-center"
                  title="Zoom Out"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                </button>
            </div>
            
            <button 
              onClick={() => setShowCities(!showCities)}
              className={`p-2.5 backdrop-blur rounded-lg border border-slate-700 transition-colors shadow-lg w-10 flex justify-center ${showCities ? 'bg-indigo-600/80 text-white' : 'bg-slate-800/80 text-slate-400 hover:text-white'}`}
              title={showCities ? "Hide Cities" : "Show Cities"}
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4 8 4v14"/><path d="M17 21v-8.66a2 2 0 0 0-1.44-1.91l-2.4-1.2a2 2 0 0 0-1.8 0l-2.4 1.2A2 2 0 0 0 7.56 12.34V21"/></svg>
            </button>

            <button 
              onClick={handleReset}
              className="p-2.5 bg-slate-800/80 backdrop-blur hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors shadow-lg w-10 flex justify-center"
              title="Reset View"
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
            </button>
        </div>

        {/* Loading State if no data yet */}
        {countries.features.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950 z-30">
             <div className="flex flex-col items-center gap-3">
               <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
               <span className="text-slate-500 text-sm font-medium animate-pulse">Loading Geodata...</span>
             </div>
          </div>
        )}
      </div>

      <p className="mt-6 text-slate-500 text-sm flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        Interact: Drag to rotate, scroll to zoom, hover to highlight countries & cities.
      </p>

      <div className="mt-auto w-full">
        <Footer />
      </div>
    </div>
  );
}