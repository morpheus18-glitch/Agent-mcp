import { v4 as uuidv4 } from "uuid"
import type { AgentConfig, Conversation, Message } from "@/types/sandbox"
import { GroqChat } from "@ai-sdk/groq"
import { createMCP, type MCPContext, type MCPMessage } from "./protocols/mcp"
import { createA2A, type A2AAgent } from "./protocols/a2a"

// Initialize the Groq client
const getGroqClient = () => {
  const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY
  if (!apiKey) {
    throw new Error("Groq API key is missing. Please set the NEXT_PUBLIC_GROQ_API_KEY environment variable.")
  }
  return new GroqChat({ apiKey })
}

// Create A2A protocol instance
const a2aProtocol = createA2A()

export async function startConversation(
  agents: AgentConfig[],
  topic: string,
  objective: string,
  systemPrompt: string,
): Promise<Conversation> {
  // Create a new conversation
  const conversationId = uuidv4()
  const conversation: Conversation = {
    id: conversationId,
    topic,
    objective,
    systemPrompt,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  // Register agents with A2A protocol
  agents.forEach((agent) => {
    const a2aAgent: A2AAgent = {
      id: agent.id,
      name: agent.name,
      role: agent.role,
      capabilities: [agent.role],
      description: `${agent.name} is a ${agent.role}`,
      instructions: agent.instructions,
      model: agent.model,
      provider: "groq",
      metadata: {
        avatar: agent.avatar,
        color: agent.color,
      },
    }

    a2aProtocol.registerAgent(a2aAgent)
  })

  // Create A2A conversation
  a2aProtocol.createConversation(
    topic,
    agents.map((a) => a.id),
  )

  // Generate the first message from the first agent
  const firstMessage = await generateAgentMessage(agents[0], conversation, [])
  conversation.messages = [firstMessage]

  return conversation
}

export async function generateAgentMessage(
  agent: AgentConfig,
  conversation: Conversation,
  previousMessages: Message[],
): Promise<Message> {
  try {
    // Check if GROQ_API_KEY is available
    if (!process.env.NEXT_PUBLIC_GROQ_API_KEY) {
      throw new Error("Groq API key is missing. Please set the NEXT_PUBLIC_GROQ_API_KEY environment variable.")
    }

    // Create MCP context
    const mcpContext: Partial<MCPContext> = {
      conversationId: conversation.id,
      metadata: {
        modelId: agent.model,
        modelProvider: "groq",
        modelVersion: "1.0",
        temperature: 0.7,
      },
    }

    const mcp = createMCP(mcpContext)

    // Add system instruction
    mcp.addInstruction({
      type: "directive",
      content: `You are ${agent.name}, with the following instructions: ${agent.instructions}
      
      You are participating in a multi-agent conversation about ${conversation.topic}.
      
      Objective: ${conversation.objective}
      
      ${conversation.systemPrompt || ""}
      
      Respond as ${agent.name}. Keep your response concise (under 150 words).
      
      Include your thinking process by adding 'Thinking: [your thought process]' at the end of your response.`,
      priority: 10,
    })

    // Add previous messages to MCP
    previousMessages.forEach((msg) => {
      // Need to get agents from somewhere accessible in this scope
      // Option 1: Pass agents as an argument to this function
      // Option 2: Retrieve agents from the conversation object (if available)
      // Option 3: Retrieve agents from a global store (not recommended)
      // Assuming agents can be derived from the conversation messages for now
      const agentIds = [...new Set(conversation.messages.map((msg) => msg.agentId))]
      const agents: AgentConfig[] = agentIds.map((id) => {
        const message = conversation.messages.find((msg) => msg.agentId === id)
        if (!message) throw new Error(`No message found for agent ${id}`)

        // Find the agent in the conversation
        const agent = conversation.messages
          .filter((msg) => msg.agentId === id)
          .map((msg) => msg.metadata?.agent as AgentConfig)
          .find((a) => a !== undefined)

        if (!agent) {
          // If agent metadata is not found, create a placeholder
          return {
            id,
            name: `Agent ${id.substring(0, 4)}`,
            model: "llama3-70b-8192",
            avatar: "/placeholder.svg?height=40&width=40",
            instructions: "You are a helpful assistant.",
            color: "#4f46e5",
            role: "assistant",
          }
        }

        return agent
      })

      const role = msg.agentId === agent.id ? "assistant" : "user"
      const name = agents.find((a) => a.id === msg.agentId)?.name || msg.agentId

      mcp.addMessage({
        role: role as MCPMessage["role"],
        content: msg.content,
        name,
      })
    })

    // Create prompt using MCP
    const prompt = mcp.createPrompt()

    // Initialize Groq client
    const groqClient = getGroqClient()

    // Generate response using Groq
    const response = await groqClient.chat({
      model: agent.model || "llama3-70b-8192",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: "Now it's your turn to respond. Remember to stay in character." },
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    // Extract content from response
    const content = response.choices[0].message.content || ""

    // Process response with MCP
    const mcpResponse = mcp.processResponse(content, {
      completionTokens: response.usage?.completion_tokens || 0,
      promptTokens: response.usage?.prompt_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0,
    })

    // Create message object
    const message: Message = {
      id: uuidv4(),
      conversationId: conversation.id,
      agentId: agent.id,
      content: mcpResponse.content,
      timestamp: new Date().toISOString(),
      metadata: {
        thinking: mcpResponse.metadata.thinking,
        tokens: mcpResponse.metadata.totalTokens,
        latency: mcpResponse.metadata.latency,
      },
    }

    // Add message to A2A conversation if it exists
    try {
      const a2aConversation = a2aProtocol.getConversation(conversation.id)
      if (a2aConversation) {
        a2aProtocol.sendMessage(conversation.id, agent.id, mcpResponse.content, {
          type: "response",
          metadata: {
            thinking: mcpResponse.metadata.thinking,
          },
        })
      }
    } catch (error) {
      console.warn("Failed to add message to A2A conversation:", error)
    }

    return message
  } catch (error) {
    console.error("Error generating agent message:", error)
    throw error
  }
}

export async function continueConversation(conversation: Conversation, nextAgentIndex: number): Promise<Message> {
  // Get all agents from the conversation messages
  const agentIds = [...new Set(conversation.messages.map((msg) => msg.agentId))]
  const agents: AgentConfig[] = agentIds.map((id) => {
    const message = conversation.messages.find((msg) => msg.agentId === id)
    if (!message) throw new Error(`No message found for agent ${id}`)

    // Find the agent in the conversation
    const agent = conversation.messages
      .filter((msg) => msg.agentId === id)
      .map((msg) => msg.metadata?.agent as AgentConfig)
      .find((a) => a !== undefined)

    if (!agent) {
      // If agent metadata is not found, create a placeholder
      return {
        id,
        name: `Agent ${id.substring(0, 4)}`,
        model: "llama3-70b-8192",
        avatar: "/placeholder.svg?height=40&width=40",
        instructions: "You are a helpful assistant.",
        color: "#4f46e5",
        role: "assistant",
      }
    }

    return agent
  })

  const nextAgent = agents[nextAgentIndex % agents.length]
  const newMessage = await generateAgentMessage(nextAgent, conversation, conversation.messages)
  return newMessage
}



export async function queryConversation(conversationId: string, queryText: string): Promise<string> {
  // Use MCP for querying the conversation
  try {
    const mcpContext: Partial<MCPContext> = {
      conversationId,
      metadata: {
        modelId: "llama3-70b-8192",
        modelProvider: "groq",
        modelVersion: "1.0",
        temperature: 0.5,
      },
    }

    const mcp = createMCP(mcpContext)

    // Add system instruction for analysis
    mcp.addInstruction({
      type: "directive",
      content: `You are an expert conversation analyst. Analyze the conversation and provide insights based on the query.
      
      Query: ${queryText}
      
      Provide a detailed analysis with specific examples from the conversation.`,
      priority: 10,
    })

    // Initialize Groq client
    const groqClient = getGroqClient()

    // Generate analysis using Groq
    const response = await groqClient.chat({
      model: "llama3-70b-8192",
      messages: [{ role: "system", content: mcp.createPrompt() }],
      temperature: 0.5,
      max_tokens: 1000,
    })

    return response.choices[0].message.content || "No analysis available."
  } catch (error) {
    console.error("Error querying conversation:", error)
    return `Error analyzing conversation: ${error instanceof Error ? error.message : "Unknown error"}`
  }
}
