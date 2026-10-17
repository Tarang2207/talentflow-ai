// server/utils/vectorGenerator.js
import { pipeline } from "@xenova/transformers";

let extractor = null;

// Lazy-load the feature extraction model pipeline
const getExtractor = async () => {
  if (!extractor) {
    try {
      extractor = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2",
      );
    } catch (err) {
      console.warn(
        "Failed to initialize @xenova/transformers pipeline, using fallback embeddings:",
        err.message,
      );
    }
  }
  return extractor;
};

/**
 * Generates a 384-dimensional vector embedding from text.
 * @param {string} text - Raw input text to generate embedding for.
 * @returns {Promise<number[]>} - 384-float array representing the text vector.
 */
export const generateEmbedding = async (text) => {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return new Array(384).fill(0);
  }

  try {
    const pipe = await getExtractor();
    if (pipe) {
      const output = await pipe(text, { pooling: "mean", normalize: true });
      return Array.from(output.data);
    }
  } catch (error) {
    console.warn(
      "Vector embedding generation fallback triggered:",
      error.message,
    );
  }

  // Deterministic 384-dimensional fallback vector if model fails to load
  const fallbackVector = new Array(384).fill(0.01);
  for (let i = 0; i < text.length; i++) {
    fallbackVector[i % 384] =
      (fallbackVector[i % 384] + text.charCodeAt(i) / 255) / 2;
  }
  return fallbackVector;
};
