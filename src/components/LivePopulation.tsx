import React, { useState, useEffect } from 'react';

const LivePopulation: React.FC = () => {
  // Starting approximate value based on user screenshot context
  const [count, setCount] = useState<number>(8264905788);

  useEffect(() => {
    // Simulate live births (net growth ~2.6 people per second globally)
    const interval = setInterval(() => {
      setCount(prev => prev + 1);
    }, 400); // Update roughly every 400ms to mimic the live feel

    return () => {
      clearInterval(interval);
    };
  }, []);

  const formattedCount = new Intl.NumberFormat('en-US').format(count);

  return (
    <div className="flex flex-col items-center md:items-start space-y-4">
      <div className="relative">
        
        <h2 className="text-xs md:text-sm font-semibold text-emerald-400 uppercase tracking-widest mb-4 flex items-center justify-center md:justify-start gap-2">
           Current Population
        </h2>
        
        <div className="relative flex items-baseline font-mono font-bold text-5xl md:text-6xl lg:text-7xl text-white tracking-tighter select-none overflow-hidden">
            {formattedCount.split('').map((char, index) => {
              const isComma = char === ',';
              
              if (isComma) {
                 return (
                    <span 
                      key={`comma-${index}`} 
                      className="text-slate-600 mx-1 text-3xl md:text-4xl self-end mb-3 select-none"
                    >
                      ,
                    </span>
                 );
              }
              
              // Key based on index AND char ensures a re-render (and thus animation) when the digit changes
              return (
                 <span 
                    key={`${index}-${char}`}
                    className="inline-block animate-slide-up text-slate-100"
                 >
                    {char}
                 </span>
              );
            })}
        </div>
      </div>
      <p className="text-slate-400 text-sm opacity-80 pl-1">
        Estimated humans currently living on Earth
      </p>
    </div>
  );
};

export default LivePopulation;