/**
 * Agent-to-Agent (A2A) Protocol
 *
 * A protocol for structured communication between AI agents.
 * A2A provides a standardized way for agents to communicate, collaborate,
 * and coordinate to solve complex tasks.
 */

import type { MCPMessage } from "./mcp";

export interface A2AAgent {
  id: string;
  name: string;
  role: string;
  capabilities: string[];
  description: string;
  instructions: string;
  model: string;
  provider: string;

  // Agent-specific metadata
  metadata?: {
    avatar?: string;
    color?: string;
    expertise?: string[];
    personality?: string[];
    [key: string]: unknown;
  };
}

export interface A2AMessage {
  id: string;
  senderId: string;
  receiverId: string | "broadcast";
  content: string;
  timestamp: string;
  type: "request" | "response" | "notification" | "query" | "command";

  // Message-specific metadata
  metadata?: {
    priority: "low" | "medium" | "high" | "critical";
    expiresAt?: string;
    requiresResponse?: boolean;
    inResponseTo?: string;
    [key: string]: unknown;
  };
}

export interface A2ATask {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  assignedTo: string | string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deadline?: string;
  priority: "low" | "medium" | "high" | "critical";

  // Task-specific metadata
  metadata?: {
    progress?: number;
    dependencies?: string[];
    subtasks?: string[];
    [key: string]: unknown;
  };
}

export interface A2AConversation {
  id: string;
  title: string;
  participants: string[];
  messages: A2AMessage[];
  createdAt: string;
  updatedAt: string;
  status: "active" | "paused" | "completed";

  // Conversation-specific metadata
  metadata?: {
    topic?: string;
    objective?: string;
    [key: string]: unknown;
  };
}

export class AgentToAgentProtocol {
  private agents: Map<string, A2AAgent> = new Map();
  private conversations: Map<string, A2AConversation> = new Map();
  private tasks: Map<string, A2ATask> = new Map();

  constructor() {}

  // Register a new agent
  registerAgent(agent: A2AAgent): void {
    this.agents.set(agent.id, agent);
  }

  // Get an agent by ID
  getAgent(agentId: string): A2AAgent | undefined {
    return this.agents.get(agentId);
  }

  // Get all registered agents
  getAllAgents(): A2AAgent[] {
    return Array.from(this.agents.values());
  }

  // Create a new conversation
  createConversation(title: string, participants: string[]): string {
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    // Verify all participants are registered
    for (const participantId of participants) {
      if (!this.agents.has(participantId)) {
        throw new Error(`Agent with ID ${participantId} is not registered`);
      }
    }

    const conversation: A2AConversation = {
      id,
      title,
      participants,
      messages: [],
      createdAt: timestamp,
      updatedAt: timestamp,
      status: "active",
    };

    this.conversations.set(id, conversation);
    return id;
  }

  // Get a conversation by ID
  getConversation(conversationId: string): A2AConversation | undefined {
    return this.conversations.get(conversationId);
  }

  // Send a message in a conversation
  sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    options: {
      receiverId?: string;
      type?: A2AMessage["type"];
      metadata?: A2AMessage["metadata"];
    } = {},
  ): string {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation with ID ${conversationId} not found`);
    }

    if (!conversation.participants.includes(senderId)) {
      throw new Error(
        `Agent with ID ${senderId} is not a participant in this conversation`,
      );
    }

    const receiverId = options.receiverId || "broadcast";
    if (
      receiverId !== "broadcast" &&
      !conversation.participants.includes(receiverId)
    ) {
      throw new Error(
        `Agent with ID ${receiverId} is not a participant in this conversation`,
      );
    }

    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const message: A2AMessage = {
      id,
      senderId,
      receiverId,
      content,
      timestamp,
      type: options.type || "notification",
      metadata: options.metadata,
    };

    conversation.messages.push(message);
    conversation.updatedAt = timestamp;

    return id;
  }

  // Create a new task
  createTask(
    title: string,
    description: string,
    assignedTo: string | string[],
    createdBy: string,
    options: {
      priority?: A2ATask["priority"];
      deadline?: string;
      metadata?: A2ATask["metadata"];
    } = {},
  ): string {
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    // Verify all assigned agents are registered
    const assignees = Array.isArray(assignedTo) ? assignedTo : [assignedTo];
    for (const assigneeId of assignees) {
      if (!this.agents.has(assigneeId)) {
        throw new Error(`Agent with ID ${assigneeId} is not registered`);
      }
    }

    const task: A2ATask = {
      id,
      title,
      description,
      status: "pending",
      assignedTo,
      createdBy,
      createdAt: timestamp,
      updatedAt: timestamp,
      deadline: options.deadline,
      priority: options.priority || "medium",
      metadata: options.metadata,
    };

    this.tasks.set(id, task);
    return id;
  }

  // Get a task by ID
  getTask(taskId: string): A2ATask | undefined {
    return this.tasks.get(taskId);
  }

  // Update task status
  updateTaskStatus(
    taskId: string,
    status: A2ATask["status"],
    agentId: string,
  ): void {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    const assignees = Array.isArray(task.assignedTo)
      ? task.assignedTo
      : [task.assignedTo];
    if (!assignees.includes(agentId) && task.createdBy !== agentId) {
      throw new Error(
        `Agent with ID ${agentId} is not authorized to update this task`,
      );
    }

    task.status = status;
    task.updatedAt = new Date().toISOString();

    if (task.metadata && status === "completed") {
      task.metadata.progress = 100;
    }
  }

  // Find agents by capability
  findAgentsByCapability(capability: string): A2AAgent[] {
    return Array.from(this.agents.values()).filter((agent) =>
      agent.capabilities.includes(capability),
    );
  }

  // Convert A2A messages to MCP messages for a specific agent
  convertToMCPMessages(conversationId: string, agentId: string): MCPMessage[] {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation with ID ${conversationId} not found`);
    }

    if (!conversation.participants.includes(agentId)) {
      throw new Error(
        `Agent with ID ${agentId} is not a participant in this conversation`,
      );
    }

    return conversation.messages
      .filter(
        (msg) =>
          msg.receiverId === "broadcast" ||
          msg.receiverId === agentId ||
          msg.senderId === agentId,
      )
      .map((msg) => {
        const sender = this.agents.get(msg.senderId);

        return {
          role: msg.senderId === agentId ? "assistant" : "user",
          content: msg.content,
          name: sender?.name || msg.senderId,
          id: msg.id,
          timestamp: msg.timestamp,
          metadata: msg.metadata,
        };
      });
  }
}

// Helper function to create a new A2A instance
export function createA2A(): AgentToAgentProtocol {
  return new AgentToAgentProtocol();
}
