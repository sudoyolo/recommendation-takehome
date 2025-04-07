import openai
from config import config

class LLMService:
    """
    Service to handle interactions with the LLM API
    """
    
    def __init__(self):
        """
        Initialize the LLM service with configuration
        """
        openai.api_key = config['OPENAI_API_KEY']
        self.model_name = config['MODEL_NAME']
        self.max_tokens = config['MAX_TOKENS']
        self.temperature = config['TEMPERATURE']
    
    def generate_recommendations(self, user_preferences, browsing_history, all_products):
        """
        Generate personalized product recommendations based on user preferences and browsing history
        
        Parameters:
        - user_preferences (dict): User's stated preferences
        - browsing_history (list): List of product IDs the user has viewed
        - all_products (list): Full product catalog
        
        Returns:
        - dict: Recommended products with explanations
        """
        # TODO: Implement LLM-based recommendation logic
        # This is where your prompt engineering expertise will be evaluated
        
        # Get browsed products details
        browsed_products = []
        for product_id in browsing_history:
            for product in all_products:
                if product["id"] == product_id:
                    browsed_products.append(product)
                    break
        
        # Create a prompt for the LLM
        # IMPLEMENT YOUR PROMPT ENGINEERING HERE
        prompt = self._create_recommendation_prompt(user_preferences, browsed_products, all_products)
        
        # Call the LLM API
        try:
            response = openai.ChatCompletion.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": "You are a helpful eCommerce product recommendation assistant."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=self.max_tokens,
                temperature=self.temperature
            )
            
            # Parse the LLM response to extract recommendations
            # IMPLEMENT YOUR RESPONSE PARSING LOGIC HERE
            recommendations = self._parse_recommendation_response(response.choices[0].message.content, all_products)
            
            return recommendations
            
        except Exception as e:
            # Handle any errors from the LLM API
            print(f"Error calling LLM API: {str(e)}")
            raise Exception(f"Failed to generate recommendations: {str(e)}")
    
    def _create_recommendation_prompt(self, user_preferences, browsed_products, all_products):
        """
        Create a prompt for the LLM to generate recommendations
        
        This is where you should implement your prompt engineering strategy.
        
        Parameters:
        - user_preferences (dict): User's stated preferences
        - browsed_products (list): Products the user has viewed
        - all_products (list): Full product catalog
        
        Returns:
        - str: Prompt for the LLM
        """
        # TODO: Implement your prompt engineering strategy
        # THIS FUNCTION MUST BE IMPLEMENTED BY THE CANDIDATE
        
        # First, determine relevant products based on user preferences to reduce token usage
        relevant_products = self._filter_relevant_products(user_preferences, browsed_products, all_products)

        # Example basic prompt structure (you should significantly improve this):
        prompt = """You are an expert e-commerce personalization engine that provides highly tailored product recommendations.
Your task is to analyze a user's preferences and browsing history, then recommend products that would genuinely interest them.
For each recommendation, provide thoughtful reasoning that connects the product's attributes to the user's demonstrated preferences.

Follow these guidelines:
1. Prioritize products that match multiple preference criteria
2. Consider both explicit preferences AND implicit interests shown in browsing history
3. Recommend a diverse selection (don't recommend too many similar items)
4. For each recommendation, provide specific reasons why this product matches the user's preferences
5. If the user has browsed products from a specific brand, consider recommending other products from that brand
6. Consider price sensitivity based on the price range of browsed products

Your response MUST be in valid JSON format as shown in the example below:
[
  {
    "product_id": "product123",
    "explanation": "This product matches your preference for athletic gear and aligns with your interest in running shoes based on your browsing history. The price point is within your preferred range, and it features the lightweight design you indicated as important.",
    "score": 9
  },
  ...
]
"""

        # Add user preferences to the prompt
        prompt += "\n\n## USER PREFERENCES\n"
        if user_preferences:
            for key, value in user_preferences.items():
                prompt += f"- {key}: {value}\n"
        else:
            prompt += "- No explicit preferences provided\n"
        
        # Add browsing history to the prompt
        prompt += "\n\n## BROWSING HISTORY\n"
        if browsed_products:
            for i, product in enumerate(browsed_products, 1):
                prompt += f"{i}. {product['name']} (ID: {product['id']})\n"
                prompt += f"   - Category: {product['category']}, Subcategory: {product.get('subcategory', 'N/A')}\n"
                prompt += f"   - Price: ${product['price']}, Brand: {product['brand']}, Rating: {product.get('rating', 'N/A')}\n"
                prompt += f"   - Tags: {', '.join(product.get('tags', []))}\n"
                
                # Truncate description to save tokens
                description = product.get('description', '')
                if description and len(description) > 100:
                    description = description[:97] + "..."
                prompt += f"   - Description: {description}\n"
        else:
            prompt += "- No browsing history available\n"
        
        # Add available products (filtered for relevance)
        prompt += "\n\n## AVAILABLE PRODUCTS FOR RECOMMENDATION\n"
        for i, product in enumerate(relevant_products, 1):
            prompt += f"{i}. {product['name']} (ID: {product['id']})\n"
            prompt += f"   - Category: {product['category']}, Subcategory: {product.get('subcategory', 'N/A')}\n"
            prompt += f"   - Price: ${product['price']}, Brand: {product['brand']}\n"
            prompt += f"   - Tags: {', '.join(product.get('tags', []))}\n"
            
            # Include features as they're important for recommendations
            if 'features' in product and product['features']:
                prompt += f"   - Features: {', '.join(product['features'][:3])}\n"
        
        # Final instructions
        prompt += "\n\n## RECOMMENDATION TASK\n"
        prompt += "Based on the user preferences and browsing history above, recommend 5 products from the available catalog.\n"
        prompt += "For each recommendation, provide:\n"
        prompt += "1. The product_id\n"
        prompt += "2. A detailed explanation (2-3 sentences) on why this product matches the user's preferences and browsing patterns\n"
        prompt += "3. A confidence score from 1-10 indicating how well this matches their preferences\n\n"
        prompt += "Return ONLY a valid JSON array with these recommendations. Do not include any other text or explanation outside the JSON structure."
        
        # You would likely want to include the product catalog in the prompt
        # But be careful about token limits!
        # For a real implementation, you might need to filter the catalog to relevant products first
        
        return prompt
    def _filter_relevant_products(self, user_preferences, browsed_products, all_products):
        """
        Filter the product catalog to the most relevant products based on user preferences
        to keep within token limits.
        
        Parameters:
        - user_preferences (dict): User's stated preferences
        - browsed_products (list): Products the user has viewed
        - all_products (list): Full product catalog
        
        Returns:
        - list: Filtered list of relevant products
        """
        relevant_products = []
        browsed_product_ids = [p['id'] for p in browsed_products]
        
        # Create a set of relevant categories from user preferences and browsing history
        relevant_categories = set()
        relevant_brands = set()
        relevant_tags = set()
        
        # Extract categories and brands from user preferences
        if user_preferences.get('preferred_categories'):
            if isinstance(user_preferences['preferred_categories'], list):
                relevant_categories.update(user_preferences['preferred_categories'])
            else:
                # Handle case where it might be a comma-separated string
                categories = [c.strip() for c in user_preferences['preferred_categories'].split(',')]
                relevant_categories.update(categories)
        
        if user_preferences.get('preferred_brands'):
            if isinstance(user_preferences['preferred_brands'], list):
                relevant_brands.update(user_preferences['preferred_brands'])
            else:
                brands = [b.strip() for b in user_preferences['preferred_brands'].split(',')]
                relevant_brands.update(brands)
        
        # Extract categories, brands and tags from browsing history
        for product in browsed_products:
            relevant_categories.add(product['category'])
            relevant_brands.add(product['brand'])
            if 'tags' in product:
                relevant_tags.update(product['tags'])
        
        # Parse price range preferences
        min_price = 0
        max_price = float('inf')
        
        if user_preferences.get('price_range'):
            price_range = user_preferences['price_range']
            if isinstance(price_range, dict):
                min_price = float(price_range.get('min', 0))
                max_price = float(price_range.get('max', float('inf')))
            elif isinstance(price_range, str) and '-' in price_range:
                parts = price_range.split('-')
                min_price = float(parts[0].strip().replace('$', ''))
                max_price = float(parts[1].strip().replace('$', ''))
        
        # Score each product for relevance
        product_scores = []
        for product in all_products:
            # Skip products already browsed
            if product['id'] in browsed_product_ids:
                continue
            
            score = 0
            
            # Category match
            if product['category'] in relevant_categories:
                score += 3
            
            # Brand match
            if product['brand'] in relevant_brands:
                score += 2
            
            # Price range match
            if min_price <= product['price'] <= max_price:
                score += 2
            
            # Tag match
            if 'tags' in product:
                matching_tags = set(product['tags']) & relevant_tags
                score += len(matching_tags)
            
            # Add to scoring list if it has any relevance
            if score > 0:
                product_scores.append((product, score))
        
        # Sort by relevance score and take top results
        product_scores.sort(key=lambda x: x[1], reverse=True)
        
        # Get top 20 relevant products or all if less than 20
        max_products = min(20, len(product_scores))
        relevant_products = [item[0] for item in product_scores[:max_products]]
        
        # If we have fewer than 10 products, add some random ones for diversity
        if len(relevant_products) < 10:
            available_products = [p for p in all_products if p['id'] not in browsed_product_ids and p not in relevant_products]
            import random
            random_products = random.sample(available_products, min(10 - len(relevant_products), len(available_products)))
            relevant_products.extend(random_products)
        
        return relevant_products
    
    def _parse_recommendation_response(self, llm_response, all_products):
        """
        Parse the LLM response to extract product recommendations
        
        Parameters:
        - llm_response (str): Raw response from the LLM
        - all_products (list): Full product catalog to match IDs with full product info
        
        Returns:
        - dict: Structured recommendations
        """
        # TODO: Implement response parsing logic
        # THIS FUNCTION MUST BE IMPLEMENTED BY THE CANDIDATE
        
        # Example implementation (very basic, should be improved):
        try:
            import json
            import re
            # Try to find JSON content in the response
            # First attempt: Look for array brackets
            json_match = re.search(r'\[.*\]', llm_response, re.DOTALL)
            
            if json_match:
                json_str = json_match.group(0)
            else:
                # Second attempt: Look for content between code blocks
                code_block_match = re.search(r'```(?:json)?(.*?)```', llm_response, re.DOTALL)
                if code_block_match:
                    json_str = code_block_match.group(1).strip()
                else:
                    # Fallback if JSON parsing fails
                    return {
                        "recommendations": [],
                        "error": "Could not parse recommendations from LLM response"
                    }
            
            # Clean up any non-JSON text that might be in the string
            json_str = json_str.strip()
            if not (json_str.startswith('[') and json_str.endswith(']')):
                # Try to find the start and end of JSON array
                start_idx = json_str.find('[')
                end_idx = json_str.rfind(']') + 1
                if start_idx >= 0 and end_idx > 0:
                    json_str = json_str[start_idx:end_idx]

            # Parse the JSON string
            rec_data = json.loads(json_str)
            
            # Enrich recommendations with full product details
            recommendations = []
            for rec in rec_data:
                product_id = rec.get('product_id')
                product_details = None
                
                # Find the full product details
                for product in all_products:
                    if product['id'] == product_id:
                        product_details = product
                        break
                
                if product_details:
                    recommendations.append({
                        "product": product_details,
                        "explanation": rec.get('explanation', ''),
                        "confidence_score": rec.get('score', 5)
                    })
            
            return {
                "recommendations": recommendations,
                "count": len(recommendations)
            }
            
        except Exception as e:
            print(f"Error parsing LLM response: {str(e)}")
            return {
                "recommendations": [],
                "error": f"Failed to parse recommendations: {str(e)}"
            }