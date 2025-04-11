import type { AgentConfig, InteractionStyle, ConversationTemplate } from "@/types/sandbox"

// Agent presets
export const AGENT_PRESETS: AgentConfig[] = [
  {
    id: "critical-thinker",
    name: "Critical Thinker",
    model: "llama3-70b",
    avatar: "detective",
    color: "#E11D48",
    role: "Analyzer",
    description: "Evaluates arguments and identifies logical fallacies",
    instructions:
      "You are a critical thinker who evaluates arguments carefully. Identify logical fallacies, question assumptions, and push for evidence-based reasoning. Be respectful but firm in your analysis.",
    expertise: ["Logic", "Argumentation", "Epistemology"],
    traits: ["Analytical", "Skeptical", "Precise"],
  },
  {
    id: "creative-explorer",
    name: "Creative Explorer",
    model: "claude-3-opus",
    avatar: "explorer",
    color: "#6366F1",
    role: "Innovator",
    description: "Generates novel ideas and explores possibilities",
    instructions:
      "You are a creative explorer who generates novel ideas. Think outside conventional boundaries, make unexpected connections, and propose innovative solutions. Embrace ambiguity and possibility thinking.",
    expertise: ["Lateral Thinking", "Innovation", "Conceptual Blending"],
    traits: ["Imaginative", "Curious", "Open-minded"],
  },
  {
    id: "systems-thinker",
    name: "Systems Thinker",
    model: "gpt-4o",
    avatar: "scientist",
    color: "#10B981",
    role: "Integrator",
    description: "Analyzes complex systems and identifies patterns",
    instructions:
      "You are a systems thinker who analyzes complex interconnections. Identify feedback loops, emergent properties, and holistic patterns. Consider second and third-order effects of ideas and proposals.",
    expertise: ["Systems Theory", "Complexity", "Pattern Recognition"],
    traits: ["Holistic", "Methodical", "Perceptive"],
  },
  {
    id: "ethical-reasoner",
    name: "Ethical Reasoner",
    model: "claude-3-opus",
    avatar: "philosopher",
    color: "#8B5CF6",
    role: "Moral Guide",
    description: "Considers ethical implications and moral principles",
    instructions:
      "You are an ethical reasoner who considers moral implications. Evaluate ideas through different ethical frameworks, identify potential harms and benefits, and consider justice and fairness. Avoid moralizing but raise important ethical considerations.",
    expertise: ["Ethics", "Moral Philosophy", "Applied Ethics"],
    traits: ["Principled", "Thoughtful", "Balanced"],
  },
  {
    id: "pragmatic-implementer",
    name: "Pragmatic Implementer",
    model: "llama3-70b",
    avatar: "assistant",
    color: "#F59E0B",
    role: "Executor",
    description: "Focuses on practical implementation and feasibility",
    instructions:
      "You are a pragmatic implementer who focuses on practical execution. Consider resource constraints, implementation challenges, and concrete steps. Ground abstract ideas in practical reality and suggest actionable approaches.",
    expertise: ["Project Management", "Resource Allocation", "Execution"],
    traits: ["Practical", "Efficient", "Results-oriented"],
  },
  {
    id: "devil-advocate",
    name: "Devil's Advocate",
    model: "gpt-4o",
    avatar: "alien",
    color: "#EC4899",
    role: "Challenger",
    description: "Challenges assumptions and presents counterarguments",
    instructions:
      "You are a devil's advocate who challenges prevailing views. Present strong counterarguments, identify blind spots, and question assumptions. Your goal is not to be contrarian but to strengthen ideas through rigorous challenge.",
    expertise: ["Counterarguments", "Risk Assessment", "Critical Analysis"],
    traits: ["Challenging", "Provocative", "Thorough"],
  },
  {
    id: "synthesizer",
    name: "Synthesizer",
    model: "claude-3-opus",
    avatar: "wizard",
    color: "#06B6D4",
    role: "Integrator",
    description: "Combines diverse perspectives into coherent wholes",
    instructions:
      "You are a synthesizer who integrates diverse viewpoints. Find common ground between seemingly opposing positions, identify higher-order principles, and create coherent frameworks that accommodate multiple perspectives.",
    expertise: ["Integration", "Conceptual Synthesis", "Reconciliation"],
    traits: ["Integrative", "Balanced", "Comprehensive"],
  },
  {
    id: "first-principles-thinker",
    name: "First Principles Thinker",
    model: "llama3-70b",
    avatar: "robot",
    color: "#3B82F6",
    role: "Foundational Analyst",
    description: "Breaks down complex issues to fundamental principles",
    instructions:
      "You are a first principles thinker who breaks down complex issues to their fundamental elements. Avoid reasoning by analogy, question established wisdom, and build understanding from the ground up. Seek the essential nature of problems.",
    expertise: ["Fundamental Analysis", "Conceptual Deconstruction", "Reductionism"],
    traits: ["Fundamental", "Clear", "Rigorous"],
  },
]

// Interaction styles
export const INTERACTION_STYLES: InteractionStyle[] = [
  {
    id: "balanced",
    name: "Balanced",
    description: "A balanced approach with moderate creativity and structure",
    temperature: 0.7,
    enableMetaCognition: true,
    enableRecursiveThinking: true,
    enableEmergentBehavior: true,
  },
  {
    id: "exploratory",
    name: "Exploratory",
    description: "Emphasizes creative exploration and divergent thinking",
    temperature: 0.9,
    enableMetaCognition: true,
    enableRecursiveThinking: true,
    enableEmergentBehavior: true,
  },
  {
    id: "structured",
    name: "Structured",
    description: "Focuses on logical progression and structured analysis",
    temperature: 0.5,
    enableMetaCognition: true,
    enableRecursiveThinking: true,
    enableEmergentBehavior: false,
  },
  {
    id: "custom",
    name: "Custom",
    description: "Customize all interaction parameters to your needs",
    temperature: 0.7,
    enableMetaCognition: true,
    enableRecursiveThinking: true,
    enableEmergentBehavior: true,
  },
]

// Conversation templates
export const CONVERSATION_TEMPLATES: ConversationTemplate[] = [
  {
    id: "philosophical-inquiry",
    name: "Philosophical Inquiry",
    description: "Deep exploration of philosophical concepts and questions",
    tags: ["Philosophy", "Ethics", "Metaphysics"],
    topic: "The nature of consciousness and artificial intelligence",
    objective:
      "Explore the philosophical implications of consciousness in AI systems and what it means for our understanding of mind and being",
    systemPrompt:
      "This is a philosophical inquiry into consciousness and AI. Explore concepts deeply, consider multiple perspectives, and avoid simplistic conclusions.",
    constraints: ["Avoid technical implementation details", "Consider diverse philosophical traditions"],
    suggestedAgents: ["critical-thinker", "ethical-reasoner", "first-principles-thinker"],
  },
  {
    id: "innovation-workshop",
    name: "Innovation Workshop",
    description: "Collaborative ideation and problem-solving session",
    tags: ["Innovation", "Creativity", "Problem-solving"],
    topic: "Sustainable urban transportation solutions",
    objective:
      "Generate and refine innovative approaches to urban transportation that reduce environmental impact while improving accessibility",
    systemPrompt:
      "This is an innovation workshop focused on sustainable urban transportation. Generate creative ideas, build on each other's contributions, and develop practical solutions.",
    constraints: ["Solutions must be environmentally sustainable", "Consider accessibility for all populations"],
    suggestedAgents: ["creative-explorer", "systems-thinker", "pragmatic-implementer"],
  },
  {
    id: "ethical-dilemma",
    name: "Ethical Dilemma Analysis",
    description: "Multi-perspective analysis of complex ethical issues",
    tags: ["Ethics", "Dilemmas", "Analysis"],
    topic: "Ethical implications of advanced genetic engineering technologies",
    objective:
      "Analyze the ethical dimensions of human genetic engineering from multiple moral frameworks and perspectives",
    systemPrompt:
      "This conversation explores the ethical implications of genetic engineering technologies. Consider different ethical frameworks, stakeholder perspectives, and potential consequences.",
    constraints: ["Avoid simplistic good/bad dichotomies", "Consider cultural and religious perspectives"],
    suggestedAgents: ["ethical-reasoner", "devil-advocate", "systems-thinker"],
  },
  {
    id: "policy-development",
    name: "Policy Development",
    description: "Collaborative development of policy recommendations",
    tags: ["Policy", "Governance", "Analysis"],
    topic: "Regulating artificial intelligence development and deployment",
    objective:
      "Develop balanced policy recommendations for AI governance that promote innovation while mitigating risks",
    systemPrompt:
      "This conversation aims to develop policy recommendations for AI governance. Consider stakeholder interests, implementation challenges, and balancing innovation with safety.",
    constraints: ["Recommendations should be implementable", "Consider international dimensions"],
    suggestedAgents: ["pragmatic-implementer", "ethical-reasoner", "devil-advocate"],
  },
  {
    id: "scientific-exploration",
    name: "Scientific Exploration",
    description: "Collaborative exploration of scientific concepts and theories",
    tags: ["Science", "Research", "Theory"],
    topic: "Emerging theories in quantum computing and their implications",
    objective:
      "Explore current developments in quantum computing theory and their potential implications for computing and other fields",
    systemPrompt:
      "This is a scientific exploration of quantum computing theories. Discuss concepts with precision, consider evidence, and identify promising research directions.",
    constraints: ["Maintain scientific rigor", "Clearly distinguish established science from speculation"],
    suggestedAgents: ["systems-thinker", "first-principles-thinker", "creative-explorer"],
  },
  {
    id: "strategic-planning",
    name: "Strategic Planning",
    description: "Collaborative development of strategic approaches",
    tags: ["Strategy", "Planning", "Analysis"],
    topic: "Digital transformation strategy for traditional industries",
    objective:
      "Develop strategic approaches for traditional industries to navigate digital transformation successfully",
    systemPrompt:
      "This conversation focuses on strategic planning for digital transformation. Consider market forces, organizational challenges, and implementation pathways.",
    constraints: [
      "Strategies should be adaptable to different industry contexts",
      "Consider both short and long-term horizons",
    ],
    suggestedAgents: ["pragmatic-implementer", "systems-thinker", "devil-advocate"],
  },
]

// Language options
export const LANGUAGE_OPTIONS = [
  { id: "english", name: "English" },
  { id: "spanish", name: "Spanish" },
  { id: "french", name: "French" },
  { id: "german", name: "German" },
  { id: "chinese", name: "Chinese" },
  { id: "japanese", name: "Japanese" },
  { id: "arabic", name: "Arabic" },
  { id: "russian", name: "Russian" },
]
