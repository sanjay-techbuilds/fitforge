# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import uuid
from similar_images import find_similar

UPLOAD_FOLDER = "static/uploads"

app = Flask(__name__)
CORS(app)

@app.route("/api/visual-search", methods=["POST"])
def visual_search():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]
    filename = f"{uuid.uuid4().hex}.jpg"
    path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(path)

    results = find_similar(path)

    return jsonify({
        "query_image": filename,
        "results": [{"filename": fname, "score": float(sim)} for fname, sim in results]
    })

if __name__ == "__main__":
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    app.run(port=5001, debug=True)
