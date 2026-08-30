import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

const __dirname = path.resolve();

const vectorsFilePath = path.join(__dirname, 'services', 'vectors.json');
const productsFilePath = path.join(__dirname, 'services', 'products.json');

const productVectors = JSON.parse(fs.readFileSync(vectorsFilePath, 'utf-8'));
const allProducts = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));

const productsMap = new Map(allProducts.map(p => [p._id.$oid || p._id, p]));

function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0.0, magA = 0.0, magB = 0.0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        magA += vecA[i] * vecA[i];
        magB += vecB[i] * vecB[i];
    }
    magA = Math.sqrt(magA);
    magB = Math.sqrt(magB);
    if (magA === 0 || magB === 0) return 0;
    return dotProduct / (magA * magB);
}

router.post('/visual-search', async (req, res) => {
    try {
        const { vector } = req.body;
        if (!vector || !Array.isArray(vector)) {
            return res.status(400).json({ error: 'A valid vector must be provided.' });
        }

        const results = productVectors.map(product => ({
            id: product.id,
            score: cosineSimilarity(vector, product.vector)
        }));

        results.sort((a, b) => b.score - a.score);

        const topMatches = results.slice(0, 12);
        const enrichedResults = topMatches.map(match => productsMap.get(match.id)).filter(Boolean);

        // --- 👇 THIS IS THE FIX 👇 ---
        // Transform the results to flatten the _id object into a string,
        // which is what the frontend ProductCard component expects.
        const flatResults = enrichedResults.map(p => ({
            ...p,
            _id: p._id.$oid || p._id // Ensures _id is now a string
        }));
        // --- End of Fix ---

        res.json(flatResults); // 👈 Send the corrected results

    } catch (error) {
        console.error("Error in visual search:", error);
        res.status(500).json({ message: "Server error during visual search." });
    }
});

export default router;