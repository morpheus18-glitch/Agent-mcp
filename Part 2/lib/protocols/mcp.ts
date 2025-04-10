/**
 * Model Context Protocol (MCP)
 *
 * A protocol for structured communication between AI models and applications.
 * MCP provides a standardized way to manage context, instructions, and responses
 * between different components of an AI system.
 */

export interface MCPContext {
  // Core context information
  conversationId: string
  messageId: string
  timestamp: string

  // Context management
  contextWindow: {
    maxTokens: number
    usedTokens: number
    remainingTokens: number
  }

  // Metadata
  metadata: {
    modelId: string
    modelProvider: string
    modelVersion: string
    temperature: number
    topP?: number
    frequencyPenalty?: number
    presencePenalty?: number
    [key: string]: any
  }

  // Memory management
  memory: {
    shortTerm: any[]
    longTerm?: any[]
    episodic?: any[]
    semantic?: any[]
  }

  // System state
  systemState?: {
    [key: string]: any
  }
}

export interface MCPMessage {
  role: "system" | "user" | "assistant" | "function" | "tool"
  content: string
  name?: string
  id: string
  timestamp: string

  // Message-specific metadata
  metadata?: {
    thinking?: string
    confidence?: number
    sentiment?: string
    tokens?: number
    [key: string]: any
  }

  // References to other messages
  references?: {
    inReplyTo?: string
    citations?: string[]
    corrections?: string[]
  }
}

export interface MCPInstruction {
  type: "directive" | "constraint" | "preference" | "goal"
  content: string
  priority: number
  id: string
}

export interface MCPResponse {
  messageId: string
  content: string
  timestamp: string

  // Response-specific metadata
  metadata: {
    thinking?: string
    confidence?: number
    completionTokens: number
    promptTokens: number
    totalTokens: number
    latency: number
    [key: string]: any
  }

  // Function calls or tool use
  functionCalls?: {
    name: string
    arguments: any
    result?: any
  }[]

  // Error handling
  error?: {
    code: string
    message: string
    details?: any
  }
}

export class ModelContextProtocol {
  private context: MCPContext
  private messages: MCPMessage[] = []
  private instructions: MCPInstruction[] = []

  constructor(initialContext: Partial<MCPContext>) {
    // Initialize with default values and override with provided context
    this.context = {
      conversationId: initialContext.conversationId || crypto.randomUUID(),
      messageId: initialContext.messageId || crypto.randomUUID(),
      timestamp: initialContext.timestamp || new Date().toISOString(),
      contextWindow: initialContext.contextWindow || {
        maxTokens: 8192,
        usedTokens: 0,
        remainingTokens: 8192,
      },
      metadata: initialContext.metadata || {
        modelId: "default",
        modelProvider: "unknown",
        modelVersion: "1.0",
        temperature: 0.7,
      },
      memory: initialContext.memory || {
        shortTerm: [],
      },
    }
  }

  // Add a message to the context
  addMessage(message: Omit<MCPMessage, "id" | "timestamp">): string {
    const id = crypto.randomUUID()
    const timestamp = new Date().toISOString()

    const fullMessage: MCPMessage = {
      ...message,
      id,
      timestamp,
    }

    this.messages.push(fullMessage)
    return id
  }

  // Add an instruction to the context
  addInstruction(instruction: Omit<MCPInstruction, "id">): string {
    const id = crypto.randomUUID()

    const fullInstruction: MCPInstruction = {
      ...instruction,
      id,
    }

    this.instructions.push(fullInstruction)
    return id
  }

  // Get the current context
  getContext(): MCPContext {
    return this.context
  }

  // Get all messages
  getMessages(): MCPMessage[] {
    return this.messages
  }

  // Get all instructions
  getInstructions(): MCPInstruction[] {
    return this.instructions
  }

  // Update context metadata
  updateMetadata(metadata: Partial<MCPContext["metadata"]>): void {
    this.context.metadata = {
      ...this.context.metadata,
      ...metadata,
    }
  }

  // Create a formatted prompt for the model
  createPrompt(): string {
    // Sort instructions by priority
    const sortedInstructions = [...this.instructions].sort((a, b) => b.priority - a.priority)

    // Build the system prompt from instructions
    const systemPrompt = sortedInstructions
      .map((instruction) => `[${instruction.type.toUpperCase()}] ${instruction.content}`)
      .join("\n\n")

    // Format the conversation history
    const conversationHistory = this.messages.map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`).join("\n\n")

    return `${systemPrompt}\n\n${conversationHistory}`
  }

  // Process a response from the model
  processResponse(rawResponse: string, metadata: Partial<MCPResponse["metadata"]> = {}): MCPResponse {
    const messageId = crypto.randomUUID()
    const timestamp = new Date().toISOString()

    // Extract thinking if present
    let content = rawResponse
    let thinking: string | undefined

    if (rawResponse.includes("Thinking:")) {
      const parts = rawResponse.split("Thinking:")
      content = parts[0].trim()
      thinking = parts[1].trim()
    }

    // Add the response as a message
    this.addMessage({
      role: "assistant",
      content,
      metadata: {
        thinking,
      },
    })

    return {
      messageId,
      content,
      timestamp,
      metadata: {
        thinking,
        completionTokens: 0, // Would be calculated in a real implementation
        promptTokens: 0, // Would be calculated in a real implementation
        totalTokens: 0, // Would be calculated in a real implementation
        latency: 0, // Would be calculated in a real implementation
        ...metadata,
      },
    }
  }
}

// Helper function to create a new MCP instance
export function createMCP(initialContext: Partial<MCPContext> = {}): ModelContextProtocol {
  return new ModelContextProtocol(initialContext)
}
