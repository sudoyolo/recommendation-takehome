import React from 'react';

const BrowsingHistory = ({ history, products, onClearHistory }) => {
  // TODO: Implement a browsing history display
  // This component should:
  // - Show products the user has clicked on
  // - Allow clearing the browsing history
  
  if (!history || history.length === 0) {
    return (
      <div className="history-container p-4 bg-gray-50 rounded-lg shadow-sm mb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium text-gray-800">Your Browsing History</h3>
        </div>
        <p className="text-gray-500 italic">No browsing history yet. Click on products to add them here.</p>
      </div>
    );
  }

  return (
    <div className="history-container p-4 bg-gray-50 rounded-lg shadow-sm mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium text-gray-800">Your Browsing History</h3>
        <button 
          onClick={onClearHistory}
          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
        >
          Clear History
        </button>
      </div>
      
      <div className="history-items grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {products.map(product => (
          <div key={product.id} className="history-item p-3 border border-gray-200 rounded-md bg-white">
            <h4 className="font-medium text-sm">{product.name}</h4>
            <div className="text-xs text-gray-600 mt-1">
              <span className="inline-block bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 mr-1">
                {product.category}
              </span>
              <span className="text-gray-500">${product.price.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrowsingHistory;