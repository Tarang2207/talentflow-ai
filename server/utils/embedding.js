// server/utils/embedding.js
import { pipeline } from "@xenova/transformers";

let extractor = null;

// Initialize the local feature extraction model once
const getExtractor = async () => {
  if (!extractor) {
    // Downloads a lightweight 20MB open-source vector model on first run
    extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return extractor;
};

export const generateEmbedding = async (text) => {
  try {
    const generateFeature = await getExtractor();
    // Truncate text to fit model context limit
    const cleanText = text.replace(/\s+/g, " ").slice(0, 1000);
    const output = await generateFeature(cleanText, {
      pooling: "mean",
      normalize: true,
    });

    // Convert Tensor output into standard JavaScript Array
    return Array.from(output.data);
  } catch (error) {
    console.error("Error generating local vector embedding:", error);
    throw error;
  }
};
