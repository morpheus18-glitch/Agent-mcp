// Mock data for the application
import { v4 as uuidv4 } from "uuid"

// Agent type definition
export interface Agent {
  id: string
  name: string
  model: string
  avatar: string
  instructions: string
  color: string
  role: string
  description?: string
}

// Message type definition
export interface Message {
  id: string
  conversationId: string
  agentId: string
  content: string
  timestamp: string
  metadata?: {
    thinking?: string
    [key: string]: unknown
  }
}

// Conversation type definition
export interface Conversation {
  id: string
  topic: string
  objective: string
  systemPrompt?: string
  messages: Message[]
  createdAt: string
  updatedAt: string
}

// Default agents
export const defaultAgents: Agent[] = [
  {
    id: "agent-1",
    name: "Financial Analyst",
    model: "mock-model",
    avatar: "/placeholder.svg?height=40&width=40",
    instructions:
      "You are a financial analyst with expertise in market trends, investment strategies, and economic indicators. Provide data-driven insights and analytical perspectives.",
    color: "#4f46e5",
    role: "analyst",
    description: "Analyzes market data and provides financial insights",
  },
  {
    id: "agent-2",
    name: "Trader",
    model: "mock-model",
    avatar: "/placeholder.svg?height=40&width=40",
    instructions:
      "You are an experienced trader with deep knowledge of trading strategies, market psychology, and risk management. Share practical trading advice and tactical approaches.",
    color: "#10b981",
    role: "trader",
    description: "Provides trading strategies and market insights",
  },
  {
    id: "agent-3",
    name: "Economist",
    model: "mock-model",
    avatar: "/placeholder.svg?height=40&width=40",
    instructions:
      "You are an economist who understands macroeconomic trends, fiscal policies, and their impacts on markets. Provide broader economic context and theoretical frameworks.",
    color: "#f59e0b",
    role: "economist",
    description: "Analyzes economic trends and policy impacts",
  },
]

// Mock conversation
export const mockConversation: Conversation = {
  id: "conv-1",
  topic: "Current market conditions and investment opportunities",
  objective:
    "Analyze recent market trends and identify potential investment opportunities across different asset classes.",
  messages: [
    {
      id: "msg-1",
      conversationId: "conv-1",
      agentId: "agent-1",
      content:
        "Looking at recent market data, I'm seeing increased volatility in tech stocks, particularly in the AI sector. P/E ratios are stretching beyond historical norms, suggesting potential overvaluation.",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      metadata: {
        thinking:
          "Need to analyze the current market conditions objectively. Tech valuations seem high compared to historical averages, but there could be justification given the growth prospects.",
      },
    },
    {
      id: "msg-2",
      conversationId: "conv-1",
      agentId: "agent-2",
      content:
        "I'm seeing strong momentum in AI stocks despite the high valuations. The technical indicators suggest continued upward pressure in the short term. However, I'd be setting tight stop losses given the overall market uncertainty.",
      timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      metadata: {
        thinking:
          "The market sentiment is still bullish for AI, but protection is key. RSI indicators are approaching overbought territory, but haven't triggered sell signals yet.",
      },
    },
    {
      id: "msg-3",
      conversationId: "conv-1",
      agentId: "agent-3",
      content:
        "From a macroeconomic perspective, we need to consider the impact of rising interest rates on high-growth tech valuations. The Fed's recent statements suggest continued tightening, which historically compresses P/E ratios in the tech sector.",
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      metadata: {
        thinking:
          "The relationship between interest rates and growth stock valuations is critical here. Need to consider both the direct impact on discount rates and the secondary effects on corporate borrowing costs.",
      },
    },
  ],
  createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  updatedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
}

// Generate a mock conversation
export function generateMockConversation(agents: Agent[], topic: string, objective: string): Conversation {
  const mockMessages: Message[] = [
    {
      id: uuidv4(),
      conversationId: "new-conv",
      agentId: agents[0].id,
      content:
        "Looking at recent market data, I'm seeing increased volatility in tech stocks, particularly in the AI sector. P/E ratios are stretching beyond historical norms, suggesting potential overvaluation.",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      metadata: {
        thinking:
          "Need to analyze the current market conditions objectively. Tech valuations seem high compared to historical averages, but there could be justification given the growth prospects.",
      },
    },
    {
      id: uuidv4(),
      conversationId: "new-conv",
      agentId: agents[1].id,
      content:
        "I'm seeing strong momentum in AI stocks despite the high valuations. The technical indicators suggest continued upward pressure in the short term. However, I'd be setting tight stop losses given the overall market uncertainty.",
      timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      metadata: {
        thinking:
          "The market sentiment is still bullish for AI, but protection is key. RSI indicators are approaching overbought territory, but haven't triggered sell signals yet.",
      },
    },
    {
      id: uuidv4(),
      conversationId: "new-conv",
      agentId: agents[2].id,
      content:
        "From a macroeconomic perspective, we need to consider the impact of rising interest rates on high-growth tech valuations. The Fed's recent statements suggest continued tightening, which historically compresses P/E ratios in the tech sector.",
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      metadata: {
        thinking:
          "The relationship between interest rates and growth stock valuations is critical here. Need to consider both the direct impact on discount rates and the secondary effects on corporate borrowing costs.",
      },
    },
  ]

  return {
    id: uuidv4(),
    topic,
    objective,
    messages: mockMessages,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  }
}

// Generate a mock message
export function generateMockMessage(conversationId: string, agentId: string): Message {
  return {
    id: uuidv4(),
    conversationId,
    agentId,
    content:
      "Based on the current discussion, I believe we should consider a balanced approach. While tech valuations are high, the sector continues to show strong growth potential, especially in AI. However, diversification into value stocks and defensive sectors would be prudent given the macroeconomic headwinds.",
    timestamp: new Date().toISOString(),
    metadata: {
      thinking:
        "Need to synthesize the different perspectives here. The technical momentum is strong, but the macroeconomic factors suggest caution. A balanced portfolio approach seems most appropriate.",
    },
  }
}
