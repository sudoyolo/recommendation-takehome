import React, { useState, useEffect } from 'react';
import './styles/App.css';
import Catalog from './components/Catalog';
import UserPreferences from './components/UserPreferences';
import Recommendations from './components/Recommendations';
import BrowsingHistory from './components/BrowsingHistory';
import * as api from './services/api';

function App() {
  // State for products and categories
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for user data
  const [userPreferences, setUserPreferences] = useState({});
  const [browsingHistory, setBrowsingHistory] = useState([]);
  const [browsingHistoryProducts, setBrowsingHistoryProducts] = useState([]);
  
  // State for recommendations
  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  
  // Fetch all products on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        // Fetch products
        const productsData = await api.fetchProducts();
        setProducts(productsData.products);
        
        // Fetch user preferences if any
        const preferencesData = await api.getPreferences();
        setUserPreferences(preferencesData.preferences || {});
        
        // Fetch browsing history if any
        const historyData = await api.getBrowsingHistory();
        setBrowsingHistory(historyData.browsing_history || []);
        setBrowsingHistoryProducts(historyData.products || []);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to load data. Please refresh the page.');
        setIsLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);
  
  // Handler for updating user preferences
  const handlePreferencesChange = async (newPreferences) => {
    try {
      const response = await api.updatePreferences(newPreferences);
      setUserPreferences(response.preferences);
      
      // Fetch new recommendations based on updated preferences
      fetchRecommendations();
    } catch (err) {
      console.error('Error updating preferences:', err);
      alert('Failed to update preferences. Please try again.');
    }
  };
  
  // Handler for adding a product to browsing history
  const handleProductClick = async (productId) => {
    try {
      await api.addToBrowsingHistory(productId);
      
      // Refresh browsing history
      const historyData = await api.getBrowsingHistory();
      setBrowsingHistory(historyData.browsing_history || []);
      setBrowsingHistoryProducts(historyData.products || []);
      
      // Fetch new recommendations if we have preferences
      if (Object.keys(userPreferences).length > 0) {
        fetchRecommendations();
      }
    } catch (err) {
      console.error('Error updating browsing history:', err);
    }
  };
  
  // Handler for clearing browsing history
  const handleClearHistory = async () => {
    try {
      await api.clearBrowsingHistory();
      setBrowsingHistory([]);
      setBrowsingHistoryProducts([]);
    } catch (err) {
      console.error('Error clearing browsing history:', err);
      alert('Failed to clear browsing history. Please try again.');
    }
  };
  
  // Fetch recommendations from API
  const fetchRecommendations = async () => {
    try {
      setIsLoadingRecommendations(true);
      const data = await api.getRecommendations();
      setRecommendations(data.recommendations || []);
      setIsLoadingRecommendations(false);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setIsLoadingRecommendations(false);
      // Don't show error to user as recommendations might not be available yet
    }
  };
  
  // Show loading screen while initial data loads
  if (isLoading) {
    return (
      <div className="app-loading flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-medium text-gray-700 mb-2">Loading Application</h2>
          <p className="text-gray-500">Please wait while we load the product data...</p>
        </div>
      </div>
    );
  }
  
  // Show error screen if loading failed
  if (error) {
    return (
      <div className="app-error flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h2 className="text-xl font-medium text-gray-700 mb-2">Error Loading Application</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">AI-Powered Product Recommendations</h1>
          <p className="mt-2 opacity-90">Discover products tailored just for you</p>
        </div>
      </header>
      
      <main className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <UserPreferences 
              preferences={userPreferences} 
              products={products} 
              onPreferencesChange={handlePreferencesChange} 
            />
            
            <BrowsingHistory 
              history={browsingHistory} 
              products={browsingHistoryProducts}
              onClearHistory={handleClearHistory} 
            />
          </div>
          
          <div className="lg:col-span-2">
            <Recommendations 
              recommendations={recommendations} 
              isLoading={isLoadingRecommendations} 
            />
            
            <div className="catalog-section bg-white p-4 rounded-lg shadow-sm">
              <h2 className="text-xl font-medium text-gray-800 mb-4">Product Catalog</h2>
              <Catalog 
                products={products} 
                onProductClick={handleProductClick} 
                browsingHistory={browsingHistory} 
              />
            </div>
          </div>
        </div>
      </main>
      
      <footer className="app-footer bg-gray-800 text-white p-6 mt-12">
        <div className="container mx-auto text-center">
          <p>AI-Powered Product Recommendation Engine</p>
          <p className="text-sm opacity-75 mt-1">i95dev AI Engineering Intern Assignment</p>
        </div>
      </footer>
    </div>
  );
}


export default App;