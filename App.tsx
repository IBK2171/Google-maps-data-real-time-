import React, { useState, useEffect, useCallback } from 'react';
import { queryMapsGrounding } from './services/geminiService';
import { UserLocation, GroundingChunk } from './types';
import LoadingSpinner from './components/LoadingSpinner';
import GroundingLinks from './components/GroundingLinks';

const App: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [responseContent, setResponseContent] = useState<string>('');
  const [groundingUris, setGroundingUris] = useState<GroundingChunk[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'fetching' | 'granted' | 'denied' | 'error'>('idle');

  // Effect to get user's geolocation on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      setLocationStatus('fetching');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationStatus('granted');
        },
        (err) => {
          console.error("Geolocation error:", err);
          setError(`Geolocation denied or unavailable: ${err.message}. Results might be less accurate.`);
          setLocationStatus('denied');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setLocationStatus('error');
    }
  }, []); // Run only once on mount

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setError('Please enter a query.');
      return;
    }

    setLoading(true);
    setError(null);
    setResponseContent('');
    setGroundingUris([]);

    try {
      const { text, groundingUris: newGroundingUris } = await queryMapsGrounding(query, userLocation);
      setResponseContent(text);
      setGroundingUris(newGroundingUris);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, [query, userLocation]); // Dependencies: query and userLocation

  const renderMarkdown = (markdown: string) => {
    // Basic markdown to HTML conversion for common elements
    let html = markdown
      .replace(/^### (.*$)/gim, '<h3>$1</h3>') // H3
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')   // H2
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')    // H1
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>') // Bold
      .replace(/\*(.*)\*/gim, '<em>$1</em>')     // Italic
      .replace(/^- (.*$)/gim, '<li>$1</li>');    // List items
    
    // Wrap list items in <ul> if they exist
    if (html.includes('<li>')) {
      html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    }
    
    // Convert newlines to <br> for simple paragraph breaks
    html = html.split('\n').map(paragraph => `<p>${paragraph}</p>`).join('');

    return <div dangerouslySetInnerHTML={{ __html: html }} className="prose max-w-none"></div>;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 shadow-lg sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-extrabold flex items-center">
            <img src="https://fonts.gstatic.com/s/i/short-term/release/gemini/google_pin/24px.svg" alt="Google Pin Icon" className="w-8 h-8 mr-2 invert" />
            Gemini Maps Explorer
          </h1>
          <nav className="hidden md:block">
            <p className="text-sm">Powered by Google Gemini & Maps Grounding</p>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col items-center">
        <section className="bg-white rounded-xl shadow-lg p-6 md:p-8 w-full max-w-3xl mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-5 text-center">Ask Gemini about Places!</h2>
          
          {/* Geolocation Status */}
          {locationStatus === 'fetching' && (
            <div className="mb-4 text-center text-blue-600 animate-pulse">
              <p>Fetching your location for more accurate results...</p>
            </div>
          )}
          {locationStatus === 'granted' && (
            <div className="mb-4 text-center text-green-600">
              <p>Geolocation enabled for accurate local results.</p>
            </div>
          )}
          {locationStatus === 'denied' && (
            <div className="mb-4 text-center text-yellow-600">
              <p>Geolocation denied. Results might be less localized.</p>
            </div>
          )}
          {locationStatus === 'error' && (
            <div className="mb-4 text-center text-red-600">
              <p>Geolocation error. Please ensure your browser supports it.</p>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg shadow-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="E.g., 'Best Italian restaurants near me' or 'Famous landmarks in Paris'"
              disabled={loading}
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !query.trim()}
            >
              Ask Gemini
            </button>
          </form>

          {/* Loading, Error, and Response Display */}
          <div className="mt-8">
            {loading && <LoadingSpinner message="Searching with Google Maps..." />}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center" role="alert">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline ml-2">{error}</span>
              </div>
            )}
            {responseContent && (
              <div className="mt-6 p-5 bg-blue-50 border border-blue-200 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-blue-800 mb-3">Gemini's Response:</h3>
                <div className="text-gray-700 leading-relaxed text-base">
                  {renderMarkdown(responseContent)}
                </div>
              </div>
            )}
            {groundingUris.length > 0 && (
              <GroundingLinks groundingUris={groundingUris} />
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 p-4 text-center text-sm mt-auto">
        <div className="container mx-auto">
          &copy; {new Date().getFullYear()} Gemini Maps Explorer. All rights reserved.
          <p className="mt-2">
            Learn more about Gemini API billing:{" "}
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              ai.google.dev/gemini-api/docs/billing
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;