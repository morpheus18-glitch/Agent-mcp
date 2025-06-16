"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { AgentConfig } from "@/types/sandbox";
import { generateId } from "@/lib/utils";

const AVAILABLE_MODELS = [
  { id: "llama3-8b", name: "Llama 3 8B" },
  { id: "llama3-70b", name: "Llama 3 70B" },
  { id: "mistral-7b", name: "Mistral 7B" },
  { id: "phi-3", name: "Phi-3" },
  { id: "gemma-7b", name: "Gemma 7B" },
];

const AVATAR_OPTIONS = [
  { id: "robot", name: "Robot", description: "A mechanical assistant" },
  { id: "scientist", name: "Scientist", description: "A knowledge explorer" },
  { id: "assistant", name: "Assistant", description: "A helpful guide" },
  {
    id: "detective",
    name: "Detective",
    description: "An analytical investigator",
  },
  { id: "philosopher", name: "Philosopher", description: "A deep thinker" },
  { id: "wizard", name: "Wizard", description: "A magical entity" },
  { id: "alien", name: "Alien", description: "An otherworldly being" },
  { id: "explorer", name: "Explorer", description: "An adventurous traveler" },
];

interface ModelSelectorProps {
  onAddAgent: (agent: AgentConfig) => void;
}

export default function ModelSelector({ onAddAgent }: ModelSelectorProps) {
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [avatar, setAvatar] = useState("");
  const [instructions, setInstructions] = useState("");
  const [color, setColor] = useState("#6366F1");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !model || !avatar || !instructions) return;

    const newAgent: AgentConfig = {
      id: generateId(),
      name,
      model,
      avatar,
      instructions,
      color,
    };

    onAddAgent(newAgent);

    // Reset form
    setName("");
    setModel("");
    setAvatar("");
    setInstructions("");
    setColor("#6366F1");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add LLM Agent</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Agent Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Critical Thinker"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">LLM Model</Label>
            <Select value={model} onValueChange={setModel} required>
              <SelectTrigger id="model">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_MODELS.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar">Avatar Type</Label>
            <Select value={avatar} onValueChange={setAvatar} required>
              <SelectTrigger id="avatar">
                <SelectValue placeholder="Select an avatar" />
              </SelectTrigger>
              <SelectContent>
                {AVATAR_OPTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    <div className="flex items-center gap-2">
                      <span>{option.name}</span>
                      <span className="text-xs text-muted-foreground">
                        - {option.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Agent Color</Label>
            <div className="flex items-center gap-2">
              <Input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-10 p-1"
              />
              <span className="text-sm text-muted-foreground">{color}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Agent Instructions</Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Provide specific guidelines for this agent's behavior..."
              rows={4}
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Add Agent
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
