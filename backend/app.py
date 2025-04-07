from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import json

from services.llm_service import LLMService
from services.product_service import ProductService

app = FastAPI(title="AI Product Recommendation API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Initialize services
product_service = ProductService()
llm_service = LLMService()

# Load products data
all_products = product_service.get_all_products()

# In-memory storage for user data 
user_data = {
    "preferences": {},
    "browsing_history": []
}

# Pydantic models for request/response validation
class ProductResponse(BaseModel):
    products: List[Dict[str, Any]]
    count: int

class ProductDetailResponse(BaseModel):
    status: str
    product: Dict[str, Any]

class CategoriesResponse(BaseModel):
    categories: List[str]
    count: int

class BrandsResponse(BaseModel):
    brands: List[str]
    count: int

# Simplified dynamic preferences model
class UserPreferences(BaseModel):
    # This allows any dictionary structure
    model_config = {
        "extra": "allow"
    }

class BrowsingHistoryItem(BaseModel):
    product_id: str

class BrowsingHistoryResponse(BaseModel):
    browsing_history: List[str]
    products: List[Dict[str, Any]]
    count: int

class StatusResponse(BaseModel):
    status: str
    message: str

class PreferencesResponse(BaseModel):
    status: str
    message: str
    preferences: Dict[str, Any]

class RecommendationsResponse(BaseModel):
    status: str
    recommendations: List[Dict[str, Any]]
    count: int

@app.get("/", response_model=StatusResponse)
async def index():
    """Root endpoint to verify the API is running"""
    return {
        "status": "success",
        "message": "Product Recommendation API is running"
    }

@app.get("/api/products", response_model=ProductResponse)
async def get_products(category: Optional[str] = None):
    """Get all products or filter by category"""
    if category:
        filtered_products = [p for p in all_products if p['category'].lower() == category.lower()]
        return {
            "products": filtered_products,
            "count": len(filtered_products)
        }
    
    return {
        "products": all_products,
        "count": len(all_products)
    }

@app.get("/api/products/{product_id}", response_model=ProductDetailResponse)
async def get_product(product_id: str):
    """Get details for a specific product"""
    product = next((p for p in all_products if p['id'] == product_id), None)
    
    if product:
        return {
            "status": "success",
            "product": product
        }
    else:
        raise HTTPException(status_code=404, detail=f"Product with ID {product_id} not found")

@app.get("/api/categories", response_model=CategoriesResponse)
async def get_categories():
    """Get all unique product categories"""
    categories = sorted(list(set(p['category'] for p in all_products)))
    return {
        "categories": categories,
        "count": len(categories)
    }

@app.get("/api/brands", response_model=BrandsResponse)
async def get_brands():
    """Get all unique product brands"""
    brands = sorted(list(set(p['brand'] for p in all_products)))
    return {
        "brands": brands,
        "count": len(brands)
    }

@app.get("/api/preferences")
async def get_preferences():
    """Get user preferences"""
    global user_data
    return {"preferences": user_data["preferences"]}

@app.post("/api/preferences", response_model=PreferencesResponse)
async def update_preferences(preferences: Dict[str, Any]):
    """Update user preferences"""
    global user_data
    
    # Update preferences
    user_data["preferences"] = preferences
    
    return {
        "status": "success",
        "message": "Preferences updated successfully",
        "preferences": user_data["preferences"]
    }

@app.get("/api/browsing-history", response_model=BrowsingHistoryResponse)
async def get_browsing_history():
    """Get browsing history with product details"""
    global user_data
    
    # Return detailed product info for browsed items
    browsed_products = []
    for product_id in user_data["browsing_history"]:
        product = next((p for p in all_products if p['id'] == product_id), None)
        if product:
            browsed_products.append(product)
    
    return {
        "browsing_history": user_data["browsing_history"],
        "products": browsed_products,
        "count": len(browsed_products)
    }

@app.post("/api/browsing-history", response_model=StatusResponse)
async def add_to_browsing_history(history_item: BrowsingHistoryItem):
    """Add a product to browsing history"""
    global user_data
    product_id = history_item.product_id
    
    # Check if product exists
    product = next((p for p in all_products if p['id'] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail=f"Product with ID {product_id} not found")
    
    # Add to browsing history if not already there
    if product_id not in user_data["browsing_history"]:
        user_data["browsing_history"].append(product_id)
    
    return {
        "status": "success",
        "message": "Browsing history updated"
    }

@app.delete("/api/browsing-history", response_model=StatusResponse)
async def clear_browsing_history():
    """Clear browsing history"""
    global user_data
    
    # Clear browsing history
    user_data["browsing_history"] = []
    
    return {
        "status": "success",
        "message": "Browsing history cleared"
    }

@app.get("/api/recommendations", response_model=RecommendationsResponse)
async def get_recommendations():
    """Generate and return personalized product recommendations"""
    global user_data
    
    # Check if we have preferences
    if not user_data["preferences"]:
        raise HTTPException(
            status_code=400, 
            detail="No user preferences found. Please set preferences first."
        )
    
    try:
        # Call the LLM service to generate recommendations
        recommendations = llm_service.generate_recommendations(
            user_preferences=user_data["preferences"],
            browsing_history=user_data["browsing_history"],
            all_products=all_products
        )
        
        return {
            "status": "success",
            "recommendations": recommendations["recommendations"],
            "count": recommendations["count"]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")

@app.get("/api/test-llm", response_model=StatusResponse)
async def test_llm_connection():
    """Test connection to the LLM API"""
    try:
        is_connected = llm_service.test_api_connection()
        if is_connected:
            return {
                "status": "success",
                "message": "Successfully connected to LLM API"
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to connect to LLM API"
            )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error testing LLM connection: {str(e)}"
        )

# Custom exception handler for more user-friendly error messages
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return {
        "error": str(exc),
        "message": "An error occurred while processing your request"
    }

if __name__ == "__main__":
    # Run the API with uvicorn
    port = int(os.environ.get('PORT', 5000))
    uvicorn.run("app:app", host="0.0.0.0", port=5000, reload=True)