import React, { useState, useEffect } from 'react';

const UserPreferences = ({ preferences, products, onPreferencesChange }) => {
  // Added imports for useState and useEffect above
  
  // Extract unique categories and brands from products
  const categories = [...new Set(products.map(product => product.category))];
  const brands = [...new Set(products.map(product => product.brand))];
  
  // Local state to manage form values
  const [formValues, setFormValues] = useState({
    preferred_categories: preferences.preferred_categories || [],
    preferred_brands: preferences.preferred_brands || [],
    price_range: preferences.price_range || { min: 0, max: 1000 },
    style_preferences: preferences.style_preferences || []
  });
  
  // Extract all unique tags to use as style preferences
  const allTags = [...new Set(products.flatMap(product => product.tags || []))];
  
  // Update local state when preferences prop changes
  useEffect(() => {
    setFormValues({
      preferred_categories: preferences.preferred_categories || [],
      preferred_brands: preferences.preferred_brands || [],
      price_range: preferences.price_range || { min: 0, max: 1000 },
      style_preferences: preferences.style_preferences || []
    });
  }, [preferences]);
  
  // Handle category checkbox changes
  const handleCategoryChange = (category, checked) => {
    let newCategories;
    if (checked) {
      newCategories = [...formValues.preferred_categories, category];
    } else {
      newCategories = formValues.preferred_categories.filter(c => c !== category);
    }
    
    handleChange('preferred_categories', newCategories);
  };
  
  // Handle brand checkbox changes
  const handleBrandChange = (brand, checked) => {
    let newBrands;
    if (checked) {
      newBrands = [...formValues.preferred_brands, brand];
    } else {
      newBrands = formValues.preferred_brands.filter(b => b !== brand);
    }
    
    handleChange('preferred_brands', newBrands);
  };
  
  // Handle style preferences changes
  const handleStyleChange = (style, checked) => {
    let newStyles;
    if (checked) {
      newStyles = [...formValues.style_preferences, style];
    } else {
      newStyles = formValues.style_preferences.filter(s => s !== style);
    }
    
    handleChange('style_preferences', newStyles);
  };
  
  // Handle price range changes
  const handlePriceChange = (type, value) => {
    const newPriceRange = {
      ...formValues.price_range,
      [type]: parseFloat(value)
    };
    
    handleChange('price_range', newPriceRange);
  };
  
  // Generic change handler that updates state and calls parent callback
  const handleChange = (field, value) => {
    const newValues = {
      ...formValues,
      [field]: value
    };
    
    setFormValues(newValues);
    onPreferencesChange(newValues);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onPreferencesChange(formValues);
  };

  return (
    <div className="preferences-container p-4 bg-white rounded-lg shadow-sm mb-4">
      <h3 className="text-xl font-medium text-gray-800 mb-4">Your Preferences</h3>
      
      <form onSubmit={handleSubmit}>
        {/* Price Range Section */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Price Range</h4>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <span className="mr-2 text-sm text-gray-600">$</span>
              <input 
                type="number" 
                min="0" 
                max={formValues.price_range.max}
                value={formValues.price_range.min} 
                onChange={(e) => handlePriceChange('min', e.target.value)}
                className="w-24 p-2 border border-gray-300 rounded"
              />
            </div>
            <span className="text-gray-500">to</span>
            <div className="flex items-center">
              <span className="mr-2 text-sm text-gray-600">$</span>
              <input 
                type="number" 
                min={formValues.price_range.min} 
                value={formValues.price_range.max} 
                onChange={(e) => handlePriceChange('max', e.target.value)}
                className="w-24 p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>
        
        {/* Categories Section */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Categories</h4>
          <div className="categories-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {categories.map(category => (
              <label key={category} className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={formValues.preferred_categories.includes(category)} 
                  onChange={(e) => handleCategoryChange(category, e.target.checked)} 
                  className="form-checkbox h-4 w-4 text-blue-600" 
                />
                <span className="text-sm text-gray-700">{category}</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Brands Section */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Brands</h4>
          <div className="brands-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {brands.slice(0, 12).map(brand => (
              <label key={brand} className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={formValues.preferred_brands.includes(brand)} 
                  onChange={(e) => handleBrandChange(brand, e.target.checked)} 
                  className="form-checkbox h-4 w-4 text-blue-600" 
                />
                <span className="text-sm text-gray-700">{brand}</span>
              </label>
            ))}
          </div>
          {brands.length > 12 && (
            <p className="text-xs text-gray-500 mt-1">Showing 12 of {brands.length} brands</p>
          )}
        </div>
        
        {/* Style Preferences Section */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Style Preferences</h4>
          <div className="tags-grid flex flex-wrap gap-2">
            {allTags.slice(0, 15).map(tag => (
              <label 
                key={tag} 
                className={`
                  text-sm px-3 py-1 rounded-full cursor-pointer transition-colors
                  ${formValues.style_preferences.includes(tag) 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
              >
                <input 
                  type="checkbox" 
                  checked={formValues.style_preferences.includes(tag)} 
                  onChange={(e) => handleStyleChange(tag, e.target.checked)} 
                  className="sr-only" 
                />
                {tag}
              </label>
            ))}
          </div>
          {allTags.length > 15 && (
            <p className="text-xs text-gray-500 mt-1">Showing 15 of {allTags.length} style options</p>
          )}
        </div>
        
        <div className="mt-6">
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Update Preferences
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserPreferences;