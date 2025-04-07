import React from 'react';

const Recommendations = ({ recommendations, isLoading }) => {
  // TODO: Implement a display for recommended products
  // This component should:
  // - Display recommended products with explanations
  // - Show a loading state when recommendations are being generated
  // - Handle cases where no recommendations are available
  
  // Helper function to render confidence score as colored bars
  const renderConfidenceScore = (score) => {
    const fullScore = Math.floor(score);
    const segments = [];
    
    for (let i = 0; i < 10; i++) {
      let color = 'bg-gray-200';
      if (i < fullScore) {
        // Scale color from yellow to green based on score
        color = i < 3 ? 'bg-yellow-400' : 
                i < 7 ? 'bg-green-300' : 'bg-green-500';
      }
      segments.push(
        <div 
          key={i} 
          className={`h-1.5 w-3 rounded-sm ${color} mr-0.5`}
        ></div>
      );
    }
    
    return (
      <div className="flex items-center mt-1">
        <div className="flex mr-2">{segments}</div>
        <span className="text-xs text-gray-500">{score}/10</span>
      </div>
    );
  };

  return (
    <div className="recommendations-container p-4 bg-white rounded-lg shadow-sm mb-4">
      <h2 className="text-xl font-medium text-gray-800 mb-4">Recommended for You</h2>
      
      {isLoading ? (
        <div className="loading-state p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating personalized recommendations...</p>
          <p className="text-xs text-gray-500 mt-2">This may take a few moments as our AI analyzes your preferences.</p>
        </div>
      ) : recommendations && recommendations.length > 0 ? (
        <div className="recommendations-list space-y-4">
          {recommendations.map((item) => (
            <div key={item.product.id} className="recommendation-item border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-gray-800 mb-1">{item.product.name}</h3>
                  <span className="font-bold text-green-600">${item.product.price.toFixed(2)}</span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-1">
                    {item.product.category}
                  </span>
                  <span className="text-xs bg-purple-100 text-purple-800 rounded-full px-2 py-1">
                    {item.product.brand}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{item.product.description}</p>
                
                {item.product.features && (
                  <div className="features mb-3">
                    <h4 className="text-xs font-medium text-gray-700 mb-1">Key Features:</h4>
                    <ul className="text-xs text-gray-600 list-disc list-inside">
                      {item.product.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="confidence mt-2">
                  <h4 className="text-xs font-medium text-gray-700">Match Confidence:</h4>
                  {renderConfidenceScore(item.confidence_score)}
                </div>
                
                <div className="explanation mt-3 bg-yellow-50 p-3 rounded-md">
                  <h4 className="text-xs font-medium text-gray-700 mb-1">Why we recommend this:</h4>
                  <p className="text-sm text-gray-600">{item.explanation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-recommendations p-8 text-center bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-2">No recommendations yet</p>
          <p className="text-sm text-gray-500">
            Set your preferences and browse some products to get personalized recommendations!
          </p>
        </div>
      )}
    </div>
  );
};

export default Recommendations;
