import { query } from "./db"

// Simple sentiment analysis function
// In a real application, you would use a more sophisticated model or API
export function analyzeSentiment(text: string): { score: number; label: string; confidence: number } {
  // List of positive and negative words
  const positiveWords = [
    "good",
    "great",
    "excellent",
    "positive",
    "wonderful",
    "fantastic",
    "amazing",
    "love",
    "happy",
    "joy",
    "excited",
    "optimistic",
    "beneficial",
    "success",
    "successful",
    "advantage",
    "advantages",
    "helpful",
    "impressive",
  ]

  const negativeWords = [
    "bad",
    "terrible",
    "awful",
    "negative",
    "horrible",
    "disappointing",
    "hate",
    "sad",
    "unhappy",
    "angry",
    "pessimistic",
    "detrimental",
    "failure",
    "disadvantage",
    "disadvantages",
    "problem",
    "difficult",
    "poor",
  ]

  // Normalize text
  const normalizedText = text.toLowerCase()
  const words = normalizedText.match(/\b\w+\b/g) || []

  // Count positive and negative words
  let positiveCount = 0
  let negativeCount = 0

  for (const word of words) {
    if (positiveWords.includes(word)) {
      positiveCount++
    } else if (negativeWords.includes(word)) {
      negativeCount++
    }
  }

  // Calculate sentiment score (-1 to 1)
  const totalSentimentWords = positiveCount + negativeCount
  let score = 0

  if (totalSentimentWords > 0) {
    score = (positiveCount - negativeCount) / totalSentimentWords
  }

  // Determine sentiment label
  let label = "neutral"
  if (score > 0.2) {
    label = "positive"
  } else if (score < -0.2) {
    label = "negative"
  }

  // Calculate confidence (0 to 1)
  const confidence = Math.min(totalSentimentWords / 10, 1)

  return {
    score,
    label,
    confidence,
  }
}

// Store sentiment analysis in the database
export async function storeSentimentAnalysis(
  messageId: number,
  sentiment: { score: number; label: string; confidence: number },
) {
  try {
    await query(
      `INSERT INTO sentiment_analysis (message_id, sentiment_score, sentiment_label, confidence)
       VALUES ($1, $2, $3, $4)`,
      [messageId, sentiment.score, sentiment.label, sentiment.confidence],
    )

    return true
  } catch (error) {
    console.error("Error storing sentiment analysis:", error)
    return false
  }
}

// Get sentiment analysis for a message
export async function getSentimentAnalysis(messageId: number) {
  try {
    const result = await query(`SELECT * FROM sentiment_analysis WHERE message_id = $1`, [messageId])

    return result.rows[0]
  } catch (error) {
    console.error("Error getting sentiment analysis:", error)
    return null
  }
}

// Get sentiment analysis for a conversation
export async function getConversationSentiment(conversationId: number) {
  try {
    const result = await query(
      `SELECT sa.* 
       FROM sentiment_analysis sa
       JOIN messages m ON sa.message_id = m.id
       WHERE m.conversation_id = $1
       ORDER BY m.timestamp ASC`,
      [conversationId],
    )

    return result.rows
  } catch (error) {
    console.error("Error getting conversation sentiment:", error)
    return []
  }
}

// Calculate average sentiment for a conversation
export async function getAverageSentiment(conversationId: number) {
  try {
    const result = await query(
      `SELECT AVG(sentiment_score) as avg_score,
              MODE() WITHIN GROUP (ORDER BY sentiment_label) as most_common_label,
              AVG(confidence) as avg_confidence
       FROM sentiment_analysis sa
       JOIN messages m ON sa.message_id = m.id
       WHERE m.conversation_id = $1`,
      [conversationId],
    )

    return result.rows[0]
  } catch (error) {
    console.error("Error getting average sentiment:", error)
    return {
      avg_score: 0,
      most_common_label: "neutral",
      avg_confidence: 0,
    }
  }
}

// Export the functions
export default {
  analyzeSentiment,
  storeSentimentAnalysis,
  getSentimentAnalysis,
  getConversationSentiment,
  getAverageSentiment,
}
