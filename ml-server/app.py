import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import torch
from diffusers import StableDiffusionPipeline
from pymongo import MongoClient
from bson.objectid import ObjectId
import random
import requests
import atexit

# --- 1. SETUP ---
app = Flask(__name__)
CORS(app)

# Define folders for uploads and results
UPLOADS_FOLDER = 'static/uploads'
RESULTS_FOLDER = 'static/results'
os.makedirs(UPLOADS_FOLDER, exist_ok=True)
os.makedirs(RESULTS_FOLDER, exist_ok=True)

# --- 1.1. MongoDB Connection ---
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
try:
    client = MongoClient(MONGO_URI)
    db = client.get_database("ecommerce")
    products_collection = db.products
    categories_collection = db.categories
    print("Successfully connected to MongoDB 👍")
    atexit.register(lambda: client.close())
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    products_collection = None
    categories_collection = None

# --- 2. LOAD ML MODELS ---
try:
    lookbook_pipe = StableDiffusionPipeline.from_pretrained("runwayml/stable-diffusion-v1-5", torch_dtype=torch.float16)
    lookbook_pipe = lookbook_pipe.to("cuda") if torch.cuda.is_available() else lookbook_pipe
except Exception as e:
    print(f"Error loading lookbook model: {e}")
    lookbook_pipe = None
    
# Conceptual Virtual Try-On function (simplified for demonstration)
def conceptual_virtual_try_on(user_image_path, garment_image_path):
    try:
        user_img = Image.open(user_image_path).convert("RGB")
        garment_img = Image.open(garment_image_path).convert("RGBA")
        
        garment_img.thumbnail(user_img.size, Image.Resampling.LANCZOS)
        
        combined_img = user_img.copy()
        
        paste_x = (user_img.width - garment_img.width) // 2
        paste_y = (user_img.height - garment_img.height) // 2
        
        combined_img.paste(garment_img, (paste_x, paste_y), garment_img)
        
        return combined_img
    except Exception as e:
        print(f"VTON Error: {e}")
        return None

# Generative Lookbook function
def generate_lookbook(garment_name, user_prompt):
    if not lookbook_pipe:
        return None
    prompt = f"a high-fashion photoshoot of a model wearing a {garment_name}, styled for a {user_prompt}. ultra-realistic, cinematic, editorial photograph, full body shot."
    try:
        image = lookbook_pipe(prompt, num_inference_steps=25).images[0]
        return image
    except Exception as e:
        print(f"Lookbook generation error: {e}")
        return None

# --- 3. ML API Endpoints ---
@app.route('/api/try-on', methods=['POST'])
def try_on_endpoint():
    # 🚨 FINAL FIX: Change the boolean check to a proper comparison
    if products_collection is None:
        return jsonify({"message": "Database connection failed"}), 500
    
    user_image_file = request.files.get('userImage')
    product_id_str = request.form.get('productId')

    if not user_image_file or not product_id_str:
        return jsonify({"message": "Missing image or product ID"}), 400

    try:
        product = products_collection.find_one({"_id": ObjectId(product_id_str)})
        if not product:
            return jsonify({"message": "Product not found"}), 404
        
        garment_image_url = product.get("image")
        if not garment_image_url:
            return jsonify({"message": "Product has no image URL"}), 404
        
        # 🚨 FINAL FIX: Construct a full URL if the path is relative
        if not garment_image_url.startswith("http"):
            garment_image_url = f"http://127.0.0.1:5000{garment_image_url}"

        user_image_path = os.path.join(UPLOADS_FOLDER, user_image_file.filename)
        user_image_file.save(user_image_path)
        
        garment_image_response = requests.get(garment_image_url)
        garment_image_path = os.path.join(UPLOADS_FOLDER, f"garment_{product_id_str}.jpg")
        with open(garment_image_path, 'wb') as f:
            f.write(garment_image_response.content)

        result_image = conceptual_virtual_try_on(user_image_path, garment_image_path)
        
        result_image_filename = f"try_on_result_{product_id_str}.jpg"
        result_image_path = os.path.join(RESULTS_FOLDER, result_image_filename)
        result_image.save(result_image_path)
        
        return jsonify({"tryOnImageUrl": f"http://127.0.0.1:5001/static/results/{result_image_filename}"})
    except Exception as e:
        print(f"VTON Error: {e}")
        return jsonify({"message": f"An error occurred during try-on: {str(e)}"}), 500

@app.route('/api/lookbook', methods=['POST'])
def lookbook_endpoint():
    return jsonify({"lookbookImageUrl": "http://localhost:5001/static/results/lookbook_image.png"})

@app.route("/recommend/<string:product_id>")
def get_recommendations(product_id):
    print(f"Generating recommendations for product ID: {product_id}")
    recommended_products = [{"_id": "60c72b2f9b1d8e001c8a4567", "name": "Classic T-Shirt", "image": "/images/tshirt.jpg", "price": 25.00}, {"_id": "60c72b2f9b1d8e001c8a4568", "name": "Jeans", "image": "/images/jeans.jpg", "price": 50.00}, {"_id": "60c72b2f9b1d8e001c8a4569", "name": "Sneakers", "image": "/images/sneakers.jpg", "price": 75.00},]
    return jsonify(recommended_products)

@app.route("/recommend/cart", methods=["POST"])
def get_cart_recommendations():
    if products_collection is None:
        return jsonify({"message": "Database connection failed"}), 500

    data = request.get_json()
    product_ids_in_cart = data.get("productIds", [])
    
    if not product_ids_in_cart:
        return jsonify([])

    print(f"Generating recommendations for cart containing: {product_ids_in_cart}")

    product_category_map = {"68966620c17d04c9a090c911": "689663fdc445f0f1533b1179", "68966620c17d04c9a090c8b1": "689663fdc445f0f1533b1178", "68966620c17d04c9a090c770": "689663fdc445f0f1533b1175", "68966620c17d04c9a090c771": "689663fdc445f0f1533b1175", "68966620c17d04c9a090c76a": "689663fdc445f0f1533b1175",}
    
    recommendations_by_category_id = {"689663fdc445f0f1533b1175": ["pants-id-1", "shoes-id-1"], "689663fdc445f0f1533b1176": ["shirt-id-1", "tshirt-id-1", "hoodie-id-1", "shoes-id-1"], "689663fdc445f0f1533b1177": ["pants-id-1", "shoes-id-1"], "689663fdc445f0f1533b1178": ["socks-id-1"], "689663fdc445f0f1533b1179": ["pants-id-1", "shoes-id-1"],}
    
    recommended_product_ids = []
    for product_id in product_ids_in_cart:
        category_id = product_category_map.get(product_id)
        if category_id and category_id in recommendations_by_category_id:
            recommended_product_ids.extend(recommendations_by_category_id[category_id])

    unique_recommended_ids = list(set(recommended_product_ids))

    final_recommendations = []
    if unique_recommended_ids:
        try:
            object_ids = [ObjectId(p_id) for p_id in unique_recommended_ids]
            products_cursor = products_collection.find({"_id": {"$in": object_ids}})
            
            for product in products_cursor:
                product["_id"] = str(product["_id"])
                final_recommendations.append(product)
        except Exception as e:
            print(f"Error fetching products from MongoDB: {e}")

    return jsonify(final_recommendations)

if __name__ == '__main__':
    app.run(port=5001, debug=True)