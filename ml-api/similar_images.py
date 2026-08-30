# similar_images.py
import os
import numpy as np
from feature_extractor import extract_features
from sklearn.metrics.pairwise import cosine_similarity
import pickle

DATASET_FOLDER = "static/uploads"
FEATURES_FILE = "model/features.pkl"

def save_features():
    features = {}
    for fname in os.listdir(DATASET_FOLDER):
        path = os.path.join(DATASET_FOLDER, fname)
        try:
            features[fname] = extract_features(path)
        except:
            continue
    with open(FEATURES_FILE, "wb") as f:
        pickle.dump(features, f)
    print("✅ Feature vectors saved.")

def find_similar(img_path, top_k=5):
    with open(FEATURES_FILE, "rb") as f:
        saved_features = pickle.load(f)

    query_feat = extract_features(img_path)

    similarities = {}
    for fname, feat in saved_features.items():
        sim = cosine_similarity([query_feat], [feat])[0][0]
        similarities[fname] = sim

    top_matches = sorted(similarities.items(), key=lambda x: x[1], reverse=True)[:top_k]
    return top_matches
