# sentiment-api/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
import logging

# ensure vader lexicon exists
try:
    nltk.data.find("sentiment/vader_lexicon.zip")
except LookupError:
    nltk.download("vader_lexicon")

app = Flask(__name__)
CORS(app)

sia = SentimentIntensityAnalyzer()
logging.basicConfig(level=logging.INFO)


@app.route("/", methods=["GET"])
def index():
    return jsonify({"ok": True, "message": "Sentiment API running"}), 200


@app.route("/api/sentiment", methods=["POST"])
def sentiment():
    data = request.get_json(force=True, silent=True)
    if not data or "text" not in data:
        return jsonify({"error": "Please provide 'text' in JSON body"}), 400

    text = str(data["text"]).strip()
    if not text:
        return jsonify({"error": "Empty text"}), 400

    logging.info("Scoring text: %s", text[:120])
    scores = sia.polarity_scores(text)
    compound = scores.get("compound", 0.0)

    if compound >= 0.05:
        label = "positive"
    elif compound <= -0.05:
        label = "negative"
    else:
        label = "neutral"

    confidence = min(1.0, max(0.0, abs(compound)))

    return jsonify({
        "label": label,
        "scores": scores,
        "confidence": round(confidence, 3)
    }), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
