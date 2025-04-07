import React, { useState } from 'react';

const Catalog = ({ products, onProductClick, browsingHistory = [] }) => {
  // Added import for useState above
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Extract unique categories from products
  const categories = ['All', ...new Set(products.map(product => product.category))];
  
  // Filter products based on selected category and search term
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  // Check if a product is in browsing history
  const isInHistory = (productId) => {
    return browsingHistory.includes(productId);
  };

  return (
    <div className="catalog-container">
      <div className="controls flex flex-col md:flex-row gap-4 mb-4">
        <div className="category-filter md:w-1/3">
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div className="search-box md:w-2/3">
          <input 
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
      </div>
      
      {filteredProducts.length === 0 ? (
        <div className="no-results text-center p-8 bg-gray-50 rounded">
          <p className="text-gray-500">No products found matching your criteria.</p>
        </div>
      ) : (
        <div className="products-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map(product => (
            <div 
              key={product.id} 
              className={`product-card p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                isInHistory(product.id) ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => onProductClick(product.id)}
            >
              <h3 className="text-md font-medium text-gray-800 mb-1">{product.name}</h3>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm bg-gray-100 text-gray-700 rounded-full px-2 py-0.5">
                  {product.category}
                </span>
                <span className="font-medium text-green-600">${product.price.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2 mb-2">{product.description}</p>
              <div className="text-xs text-gray-500">
                <span className="block">Brand: {product.brand}</span>
                {product.rating && <span className="block">Rating: {product.rating}/5</span>}
              </div>
              {isInHistory(product.id) && (
                <div className="mt-2">
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                    In your history
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Catalog;