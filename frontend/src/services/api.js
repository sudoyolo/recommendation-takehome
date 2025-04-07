const API_BASE_URL = 'http://localhost:5000/api';

// Fetch all products from the API, with optional category filter
export const fetchProducts = async (category = null) => {
  try {
    const url = category 
      ? `${API_BASE_URL}/products?category=${encodeURIComponent(category)}`
      : `${API_BASE_URL}/products`;
      
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Fetch a single product by ID
export const fetchProductById = async (productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    throw error;
  }
};

// Fetch all available categories
export const fetchCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Fetch all available brands
export const fetchBrands = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/brands`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching brands:', error);
    throw error;
  }
};

// Get user preferences
export const getPreferences = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/preferences`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    throw error;
  }
};

// Update user preferences
export const updatePreferences = async (preferences) => {
  try {
    const response = await fetch(`${API_BASE_URL}/preferences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating preferences:', error);
    throw error;
  }
};

// Get browsing history
export const getBrowsingHistory = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/browsing-history`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching browsing history:', error);
    throw error;
  }
};

// Add product to browsing history
export const addToBrowsingHistory = async (productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/browsing-history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ product_id: productId }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding to browsing history:', error);
    throw error;
  }
};

// Clear browsing history
export const clearBrowsingHistory = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/browsing-history`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error clearing browsing history:', error);
    throw error;
  }
};

// Get recommendations based on current user preferences and browsing history
export const getRecommendations = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/recommendations`);
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw error;
  }
};

// Test LLM connection
export const testLLMConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/test-llm`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error testing LLM connection:', error);
    throw error;
  }
};