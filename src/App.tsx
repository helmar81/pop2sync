import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Improved error boundary to handle chunk load failures
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  state: { hasError: boolean; };
  props: any;
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch() { /* Log to service like Sentry */ }
  render() {
    if (this.state.hasError) return window.location.reload(); // Force refresh to get new chunks
    return this.props.children;
  }
}

// Lazy imports remain the same for performance
const Home = lazy(() => import("./components/Home"));
const Details = lazy(() => import("./components/Details"));
const WorldMap = lazy(() => import("./components/WorldMap"));
const Quiz = lazy(() => import("./components/Quiz"));

const PageLoader = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div>
  </div>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/details" element={<Details />} />
            <Route path="/map" element={<WorldMap />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default App;