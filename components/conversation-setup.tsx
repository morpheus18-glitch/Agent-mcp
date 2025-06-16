"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, Plus, Sparkles, X } from "lucide-react";
import { AgentPresetCard } from "@/components/agent-preset-card";
import { ConversationTemplate } from "@/components/conversation-template";
import {
  AGENT_PRESETS,
  CONVERSATION_TEMPLATES,
  LANGUAGE_OPTIONS,
  INTERACTION_STYLES,
} from "@/lib/presets";
import type { AgentConfig, ConversationSettings } from "@/types/sandbox";

interface ConversationSetupProps {
  onComplete: (settings: ConversationSettings, agents: AgentConfig[]) => void;
  onCancel: () => void;
}

export default function ConversationSetup({
  onComplete,
  onCancel,
}: ConversationSetupProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedAgents, setSelectedAgents] = useState<AgentConfig[]>([]);
  const [interactionStyle, setInteractionStyle] = useState<string>("balanced");
  const [customSettings, setCustomSettings] = useState<ConversationSettings>({
    topic: "",
    objective: "",
    maxTurns: 20,
    language: "english",
    temperature: 0.7,
    systemPrompt: "",
    constraints: [],
    enableMetaCognition: true,
    enableRecursiveThinking: true,
    enableVectorMonitoring: true,
    enableEmergentBehavior: true,
  });

  const handleAddAgent = (agent: AgentConfig) => {
    if (selectedAgents.some((a) => a.id === agent.id)) return;
    setSelectedAgents([...selectedAgents, agent]);
  };

  const handleRemoveAgent = (agentId: string) => {
    setSelectedAgents(selectedAgents.filter((agent) => agent.id !== agentId));
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);

    // Find the template
    const template = CONVERSATION_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    // Apply template settings
    setCustomSettings({
      ...customSettings,
      topic: template.topic,
      objective: template.objective,
      systemPrompt: template.systemPrompt || customSettings.systemPrompt,
      constraints: template.constraints || customSettings.constraints,
    });

    // Apply template agents if available
    if (template.suggestedAgents && template.suggestedAgents.length > 0) {
      const agentsToAdd = template.suggestedAgents
        .map((id) => AGENT_PRESETS.find((a) => a.id === id))
        .filter(Boolean) as AgentConfig[];

      setSelectedAgents(agentsToAdd);
    }
  };

  const handleSelectInteractionStyle = (styleId: string) => {
    setInteractionStyle(styleId);

    // Find the style
    const style = INTERACTION_STYLES.find((s) => s.id === styleId);
    if (!style) return;

    // Apply style settings
    setCustomSettings({
      ...customSettings,
      temperature: style.temperature,
      enableMetaCognition: style.enableMetaCognition,
      enableRecursiveThinking: style.enableRecursiveThinking,
      enableEmergentBehavior: style.enableEmergentBehavior,
    });
  };

  const handleAddConstraint = (constraint: string) => {
    if (!constraint.trim()) return;
    setCustomSettings({
      ...customSettings,
      constraints: [...customSettings.constraints, constraint],
    });
  };

  const handleRemoveConstraint = (index: number) => {
    setCustomSettings({
      ...customSettings,
      constraints: customSettings.constraints.filter((_, i) => i !== index),
    });
  };

  const handleComplete = () => {
    onComplete(customSettings, selectedAgents);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Conversation Setup</CardTitle>
        <CardDescription>
          Configure your multi-agent conversation environment
        </CardDescription>
      </CardHeader>

      <CardContent>
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">
              Step 1: Choose a Conversation Template
            </h3>
            <p className="text-sm text-muted-foreground">
              Select a template or create a custom conversation
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CONVERSATION_TEMPLATES.map((template) => (
                <ConversationTemplate
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplate === template.id}
                  onSelect={() => handleSelectTemplate(template.id)}
                />
              ))}

              <Card
                className={`cursor-pointer border-2 ${!selectedTemplate ? "border-primary" : "border-dashed"}`}
                onClick={() => setSelectedTemplate(null)}
              >
                <CardContent className="flex flex-col items-center justify-center h-full p-6">
                  <Plus className="h-8 w-8 mb-2 text-muted-foreground" />
                  <p className="font-medium">Custom Conversation</p>
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    Create a conversation from scratch with custom settings
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={() => setCurrentStep(2)}>
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Step 2: Select Agent Roles</h3>
            <p className="text-sm text-muted-foreground">
              Choose at least 3 agents to participate in the conversation
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {selectedAgents.map((agent) => (
                <Badge key={agent.id} variant="secondary" className="py-1 px-3">
                  {agent.name}
                  <button
                    className="ml-2 text-muted-foreground hover:text-foreground"
                    onClick={() => handleRemoveAgent(agent.id)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {selectedAgents.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No agents selected yet
                </p>
              )}
            </div>

            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AGENT_PRESETS.map((agent) => (
                  <AgentPresetCard
                    key={agent.id}
                    agent={agent}
                    isSelected={selectedAgents.some((a) => a.id === agent.id)}
                    onSelect={() => handleAddAgent(agent)}
                  />
                ))}
              </div>
            </ScrollArea>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
              <Button
                onClick={() => setCurrentStep(3)}
                disabled={selectedAgents.length < 3}
              >
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">
              Step 3: Configure Interaction Style
            </h3>

            <Tabs
              defaultValue={interactionStyle}
              onValueChange={handleSelectInteractionStyle}
            >
              <TabsList className="grid grid-cols-4 mb-4">
                {INTERACTION_STYLES.map((style) => (
                  <TabsTrigger key={style.id} value={style.id}>
                    {style.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {INTERACTION_STYLES.map((style) => (
                <TabsContent
                  key={style.id}
                  value={style.id}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h4 className="font-medium">{style.name}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {style.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="temperature">
                        Temperature: {customSettings.temperature}
                      </Label>
                      <Slider
                        id="temperature"
                        min={0}
                        max={1}
                        step={0.1}
                        value={[customSettings.temperature]}
                        onValueChange={(value) =>
                          setCustomSettings({
                            ...customSettings,
                            temperature: value[0],
                          })
                        }
                        className="mt-2"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="meta-cognition">Meta-Cognition</Label>
                        <Switch
                          id="meta-cognition"
                          checked={customSettings.enableMetaCognition}
                          onCheckedChange={(checked) =>
                            setCustomSettings({
                              ...customSettings,
                              enableMetaCognition: checked,
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="recursive-thinking">
                          Recursive Thinking
                        </Label>
                        <Switch
                          id="recursive-thinking"
                          checked={customSettings.enableRecursiveThinking}
                          onCheckedChange={(checked) =>
                            setCustomSettings({
                              ...customSettings,
                              enableRecursiveThinking: checked,
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="emergent-behavior">
                          Emergent Behavior
                        </Label>
                        <Switch
                          id="emergent-behavior"
                          checked={customSettings.enableEmergentBehavior}
                          onCheckedChange={(checked) =>
                            setCustomSettings({
                              ...customSettings,
                              enableEmergentBehavior: checked,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                Back
              </Button>
              <Button onClick={() => setCurrentStep(4)}>
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">
              Step 4: Conversation Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="topic">Conversation Topic</Label>
                  <Input
                    id="topic"
                    value={customSettings.topic}
                    onChange={(e) =>
                      setCustomSettings({
                        ...customSettings,
                        topic: e.target.value,
                      })
                    }
                    placeholder="E.g., Climate change solutions"
                  />
                </div>

                <div>
                  <Label htmlFor="objective">Conversation Objective</Label>
                  <Textarea
                    id="objective"
                    value={customSettings.objective}
                    onChange={(e) =>
                      setCustomSettings({
                        ...customSettings,
                        objective: e.target.value,
                      })
                    }
                    placeholder="What should this conversation accomplish?"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={customSettings.language}
                    onValueChange={(value) =>
                      setCustomSettings({ ...customSettings, language: value })
                    }
                  >
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGE_OPTIONS.map((lang) => (
                        <SelectItem key={lang.id} value={lang.id}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="max-turns">Maximum Conversation Turns</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="max-turns"
                      min={5}
                      max={50}
                      step={5}
                      value={[customSettings.maxTurns]}
                      onValueChange={(value) =>
                        setCustomSettings({
                          ...customSettings,
                          maxTurns: value[0],
                        })
                      }
                      className="flex-1"
                    />
                    <span className="w-12 text-center">
                      {customSettings.maxTurns}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="system-prompt">
                    System Prompt (Optional)
                  </Label>
                  <Textarea
                    id="system-prompt"
                    value={customSettings.systemPrompt}
                    onChange={(e) =>
                      setCustomSettings({
                        ...customSettings,
                        systemPrompt: e.target.value,
                      })
                    }
                    placeholder="Global instructions for all agents..."
                    rows={3}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Conversation Constraints</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="constraint"
                        placeholder="Add a constraint..."
                        className="w-48"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAddConstraint(
                              (e.target as HTMLInputElement).value,
                            );
                            (e.target as HTMLInputElement).value = "";
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const input = document.getElementById(
                            "constraint",
                          ) as HTMLInputElement;
                          handleAddConstraint(input.value);
                          input.value = "";
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {customSettings.constraints.map((constraint, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="py-1 px-3"
                      >
                        {constraint}
                        <button
                          className="ml-2 text-muted-foreground hover:text-foreground"
                          onClick={() => handleRemoveConstraint(index)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    {customSettings.constraints.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No constraints added
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <Label className="mb-2 block">Vector Monitoring</Label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      Enable RDIP Vector Monitoring
                    </span>
                    <Switch
                      checked={customSettings.enableVectorMonitoring}
                      onCheckedChange={(checked) =>
                        setCustomSettings({
                          ...customSettings,
                          enableVectorMonitoring: checked,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setCurrentStep(3)}>
                Back
              </Button>
              <Button
                onClick={handleComplete}
                disabled={!customSettings.topic || selectedAgents.length < 3}
              >
                Start Conversation <Sparkles className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
