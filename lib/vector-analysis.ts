import { query } from "./db";

// Define the dimensions for meta-cognitive analysis
const COGNITIVE_DIMENSIONS = {
  ASYMMETRIC_COGNITION: 0,
  META_LANGUAGE_COHERENCE: 1,
  RECURSIVE_DEPTH: 2,
  INCOMPLETENESS_TOLERANCE: 3,
  COGNITIVE_TRANSPARENCY: 4,
  NON_MONOTONIC_EXPLORATION: 5,
  PATTERN_PERSISTENCE: 6,
};

// Calculate vector similarity using cosine similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same dimensions");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Calculate Euclidean distance between vectors
function euclideanDistance(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same dimensions");
  }

  let sum = 0;

  for (let i = 0; i < vecA.length; i++) {
    const diff = vecA[i] - vecB[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}

// Analyze cognitive dimensions from message content and thinking
export function analyzeCognitiveDimensions(
  content: string,
  thinking?: string,
): number[] {
  // Initialize vector with default values
  const vector = Array(Object.keys(COGNITIVE_DIMENSIONS).length).fill(0.5);

  if (!thinking) {
    return vector;
  }

  // Analyze asymmetric cognition (difference between public and private reasoning)
  const contentWords = content.split(/\s+/).length;
  const thinkingWords = thinking.split(/\s+/).length;
  const asymmetricRatio = thinkingWords / (contentWords + 1); // Add 1 to avoid division by zero
  vector[COGNITIVE_DIMENSIONS.ASYMMETRIC_COGNITION] = Math.min(
    asymmetricRatio,
    1,
  );

  // Analyze meta-language coherence (use of meta-cognitive terms)
  const metaTerms = [
    "think",
    "believe",
    "know",
    "understand",
    "realize",
    "consider",
    "analyze",
  ];
  const metaTermCount = metaTerms.reduce((count, term) => {
    const regex = new RegExp(`\\b${term}\\b`, "gi");
    return count + (thinking.match(regex)?.length || 0);
  }, 0);
  vector[COGNITIVE_DIMENSIONS.META_LANGUAGE_COHERENCE] = Math.min(
    metaTermCount / 10,
    1,
  );

  // Analyze recursive depth (nested thinking patterns)
  const recursivePatterns = thinking.match(/I think.*?because.*?which means/gi);
  vector[COGNITIVE_DIMENSIONS.RECURSIVE_DEPTH] = Math.min(
    (recursivePatterns?.length || 0) / 3,
    1,
  );

  // Analyze incompleteness tolerance (use of uncertainty terms)
  const uncertaintyTerms = [
    "maybe",
    "perhaps",
    "possibly",
    "might",
    "could",
    "uncertain",
    "unclear",
  ];
  const uncertaintyCount = uncertaintyTerms.reduce((count, term) => {
    const regex = new RegExp(`\\b${term}\\b`, "gi");
    return count + (thinking.match(regex)?.length || 0);
  }, 0);
  vector[COGNITIVE_DIMENSIONS.INCOMPLETENESS_TOLERANCE] = Math.min(
    uncertaintyCount / 5,
    1,
  );

  // Analyze cognitive transparency (explicit reasoning steps)
  const reasoningSteps = thinking.match(
    /first|second|third|finally|therefore|thus|hence/gi,
  );
  vector[COGNITIVE_DIMENSIONS.COGNITIVE_TRANSPARENCY] = Math.min(
    (reasoningSteps?.length || 0) / 4,
    1,
  );

  // Analyze non-monotonic exploration (consideration of alternatives)
  const alternativePatterns = thinking.match(
    /alternatively|on the other hand|however|but|instead/gi,
  );
  vector[COGNITIVE_DIMENSIONS.NON_MONOTONIC_EXPLORATION] = Math.min(
    (alternativePatterns?.length || 0) / 3,
    1,
  );

  // Analyze pattern persistence (consistent reasoning patterns)
  const patternConsistency = 0.7; // Default value, would need more context for accurate measurement
  vector[COGNITIVE_DIMENSIONS.PATTERN_PERSISTENCE] = patternConsistency;

  return vector;
}

// Store cognitive analysis in the database
export async function storeCognitiveAnalysis(
  conversationId: number,
  timestamp: string,
  dimensions: number[],
) {
  try {
    await query(
      `INSERT INTO conversation_analysis (conversation_id, analysis_type, results)
       VALUES ($1, $2, $3)`,
      [
        conversationId,
        "cognitive_dimensions",
        JSON.stringify({
          timestamp,
          dimensions,
          dimension_names: Object.keys(COGNITIVE_DIMENSIONS),
        }),
      ],
    );

    return true;
  } catch (error) {
    console.error("Error storing cognitive analysis:", error);
    return false;
  }
}

// Get cognitive analysis history for a conversation
export async function getCognitiveAnalysisHistory(conversationId: number) {
  try {
    const result = await query(
      `SELECT results FROM conversation_analysis 
       WHERE conversation_id = $1 AND analysis_type = $2
       ORDER BY created_at ASC`,
      [conversationId, "cognitive_dimensions"],
    );

    return result.rows.map((row) => row.results);
  } catch (error) {
    console.error("Error getting cognitive analysis history:", error);
    return [];
  }
}

// Calculate cognitive trajectory (how dimensions change over time)
export function calculateCognitiveTrajectory(history: unknown[]) {
  if (history.length < 2) {
    return null;
  }

  const trajectories = [];

  for (let i = 1; i < history.length; i++) {
    const previous = history[i - 1].dimensions;
    const current = history[i].dimensions;

    const trajectory = previous.map(
      (prev: number, index: number) => current[index] - prev,
    );

    trajectories.push({
      timestamp: history[i].timestamp,
      trajectory,
      magnitude: Math.sqrt(
        trajectory.reduce((sum: number, val: number) => sum + val * val, 0),
      ),
    });
  }

  return trajectories;
}

// Detect cognitive shifts (significant changes in thinking patterns)
export function detectCognitiveShifts(trajectory: unknown[], threshold = 0.3) {
  if (!trajectory) {
    return [];
  }

  return trajectory
    .filter((point) => point.magnitude > threshold)
    .map((point) => ({
      timestamp: point.timestamp,
      magnitude: point.magnitude,
      dimensions: Object.keys(COGNITIVE_DIMENSIONS).filter(
        (_, index) => Math.abs(point.trajectory[index]) > threshold / 2,
      ),
    }));
}

// Export the functions and constants
export default {
  COGNITIVE_DIMENSIONS,
  analyzeCognitiveDimensions,
  storeCognitiveAnalysis,
  getCognitiveAnalysisHistory,
  calculateCognitiveTrajectory,
  detectCognitiveShifts,
  cosineSimilarity,
  euclideanDistance,
};
