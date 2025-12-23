import React, { Suspense, lazy } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

// Code splitting: Pages will now load only when needed
const Home = lazy(() => import("./components/Home"));
const Details = lazy(() => import("./components/Details"));
const WorldMap = lazy(() => import("./components/WorldMap"));
const Quiz = lazy(() => import("./components/Quiz"));

// High-performance loading fallback
const PageLoader = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div>
  </div>
);

const App: React.FC = () => {
  return (
    <HashRouter>
      {/* Suspense handles the loading state while lazy components are fetched */}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/details" element={<Details />} />
          <Route path="/map" element={<WorldMap />} />
          <Route path="/quiz" element={<Quiz />} />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
};

export default App;