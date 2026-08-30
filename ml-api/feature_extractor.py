# feature_extractor.py
import numpy as np
from tensorflow.keras.applications.resnet50 import ResNet50, preprocess_input
from tensorflow.keras.preprocessing import image
from tensorflow.keras.models import Model

# Load ResNet50 model pre-trained on ImageNet
base_model = ResNet50(weights='imagenet')
model = Model(inputs=base_model.input, outputs=base_model.get_layer("avg_pool").output)

def extract_features(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    expanded = np.expand_dims(img_array, axis=0)
    preprocessed = preprocess_input(expanded)
    features = model.predict(preprocessed)
    normalized = features.flatten() / np.linalg.norm(features)
    return normalized
