export interface AgentConfig {
  id: string
  name: string
  model: string
  avatar: string
  instructions: string
  color: string
  role: string
}

export interface Message {
  id: string
  conversationId: string
  agentId: string
  content: string
  timestamp: string
  metadata?: {
    thinking?: string
    agent?: AgentConfig
    [key: string]: unknown
  }
}

export interface Conversation {
  id: string
  topic: string
  objective: string
  systemPrompt?: string
  messages: Message[]
  createdAt: string
  updatedAt: string
}

export interface ConversationQuery {
  type: string
  query: string
  results: unknown
  timestamp: string
  vectorMetrics?: VectorMetrics
}

export interface VectorMetrics {
  asymmetricCognition: number
  metaLanguageCoherence: number
  recursiveDepth: number
  incompletenessReverence: number
  cognitiveTransparency: number
  nonMonotonicIntent: number
  patternPersistence: number
}

export interface VectorMetricsHistory {
  timestamp: string
  metrics: VectorMetrics
}

export interface ConversationSettings {
  topic: string
  objective: string
  maxTurns: number
  language: string
  temperature: number
  systemPrompt: string
  constraints: string[]
  enableMetaCognition: boolean
  enableRecursiveThinking: boolean
  enableVectorMonitoring: boolean
  enableEmergentBehavior: boolean
}

export interface InteractionStyle {
  id: string
  name: string
  description: string
  temperature: number
  enableMetaCognition: boolean
  enableRecursiveThinking: boolean
  enableEmergentBehavior: boolean
}

export interface ConversationTemplate {
  id: string
  name: string
  description: string
  tags: string[]
  topic: string
  objective: string
  systemPrompt?: string
  constraints?: string[]
  suggestedAgents?: string[]
}
