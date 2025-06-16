"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Save, Undo, Redo } from "lucide-react";

export function CharacterCreator({
  onSave,
}: {
  onSave: (data: Record<string, unknown>) => void;
  initialCustomization?: Record<string, unknown> | null;
}) {
  const [activeTab, setActiveTab] = useState("basic");

  // Character customization state
  const [customization, setCustomization] = useState({
    // Basic
    name: "Agent",

    // Colors
    skinColor: "#e0b69e",
    hairColor: "#3d2314",
    eyeColor: "#2f5d8a",

    // Body
    height: 0.5,
    build: 0.5,
    weight: 0.5,

    // Face
    smile: 0.5,
    eyeSize: 0.5,
    jawWidth: 0.5,
    noseSize: 0.5,

    // Styles
    hairStyle: "short",
    outfitStyle: "casual",

    // Outfit colors
    outfit: {
      top: "#4a6fa5",
      bottom: "#2d3748",
      shoes: "#1a202c",
      accessories: "#d69e2e",
    },

    // Accessories
    accessories: [],
  });

  // History for undo/redo
  const [history, setHistory] = useState([customization]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Update customization and add to history
  const updateCustomization = (updates) => {
    const newCustomization = { ...customization, ...updates };

    // Add to history, removing any future states if we're not at the end
    const newHistory = history
      .slice(0, historyIndex + 1)
      .concat(newCustomization);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    setCustomization(newCustomization);
  };

  // Undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCustomization(history[historyIndex - 1]);
    }
  };

  // Redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCustomization(history[historyIndex + 1]);
    }
  };

  // Save character
  const handleSave = () => {
    if (onSave) {
      onSave(customization);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Character Preview (simplified) */}
      <div className="flex-1">
        <Card className="h-[500px]">
          <CardHeader>
            <CardTitle>Character Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[400px] bg-gray-100 dark:bg-gray-800">
            <div className="text-center">
              <div
                className="w-32 h-32 rounded-full mx-auto mb-4"
                style={{ backgroundColor: customization.skinColor }}
              ></div>
              <div
                className="w-40 h-8 rounded-full mx-auto mb-2"
                style={{ backgroundColor: customization.hairColor }}
              ></div>
              <div className="text-lg font-medium">{customization.name}</div>
              <div className="text-sm text-muted-foreground">
                Preview will appear here
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customization Controls */}
      <div className="w-full lg:w-96">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Customization</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleUndo}
                  disabled={historyIndex === 0}
                >
                  <Undo className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRedo}
                  disabled={historyIndex === history.length - 1}
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="body">Body</TabsTrigger>
                <TabsTrigger value="outfit">Outfit</TabsTrigger>
              </TabsList>

              <div className="p-4">
                {/* Basic Tab */}
                <TabsContent value="basic" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Character Name</Label>
                    <Input
                      id="name"
                      value={customization.name}
                      onChange={(e) =>
                        updateCustomization({ name: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skinColor">Skin Color</Label>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-10 h-10 rounded-md cursor-pointer border"
                        style={{ backgroundColor: customization.skinColor }}
                      ></div>
                      <Input
                        id="skinColor"
                        value={customization.skinColor}
                        onChange={(e) =>
                          updateCustomization({ skinColor: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hairColor">Hair Color</Label>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-10 h-10 rounded-md cursor-pointer border"
                        style={{ backgroundColor: customization.hairColor }}
                      ></div>
                      <Input
                        id="hairColor"
                        value={customization.hairColor}
                        onChange={(e) =>
                          updateCustomization({ hairColor: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eyeColor">Eye Color</Label>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-10 h-10 rounded-md cursor-pointer border"
                        style={{ backgroundColor: customization.eyeColor }}
                      ></div>
                      <Input
                        id="eyeColor"
                        value={customization.eyeColor}
                        onChange={(e) =>
                          updateCustomization({ eyeColor: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Body Tab */}
                <TabsContent value="body" className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="height">Height</Label>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(customization.height * 100)}%
                      </span>
                    </div>
                    <Slider
                      id="height"
                      min={0}
                      max={1}
                      step={0.01}
                      value={[customization.height]}
                      onValueChange={([value]) =>
                        updateCustomization({ height: value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="build">Build</Label>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(customization.build * 100)}%
                      </span>
                    </div>
                    <Slider
                      id="build"
                      min={0}
                      max={1}
                      step={0.01}
                      value={[customization.build]}
                      onValueChange={([value]) =>
                        updateCustomization({ build: value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="smile">Smile</Label>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(customization.smile * 100)}%
                      </span>
                    </div>
                    <Slider
                      id="smile"
                      min={0}
                      max={1}
                      step={0.01}
                      value={[customization.smile]}
                      onValueChange={([value]) =>
                        updateCustomization({ smile: value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="eyeSize">Eye Size</Label>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(customization.eyeSize * 100)}%
                      </span>
                    </div>
                    <Slider
                      id="eyeSize"
                      min={0}
                      max={1}
                      step={0.01}
                      value={[customization.eyeSize]}
                      onValueChange={([value]) =>
                        updateCustomization({ eyeSize: value })
                      }
                    />
                  </div>
                </TabsContent>

                {/* Outfit Tab */}
                <TabsContent value="outfit" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="outfitStyle">Outfit Style</Label>
                    <select
                      id="outfitStyle"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      value={customization.outfitStyle}
                      onChange={(e) =>
                        updateCustomization({ outfitStyle: e.target.value })
                      }
                    >
                      <option value="casual">Casual</option>
                      <option value="formal">Formal</option>
                      <option value="business">Business</option>
                      <option value="sporty">Sporty</option>
                      <option value="fantasy">Fantasy</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="topColor">Top Color</Label>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-10 h-10 rounded-md cursor-pointer border"
                        style={{ backgroundColor: customization.outfit.top }}
                      ></div>
                      <Input
                        id="topColor"
                        value={customization.outfit.top}
                        onChange={(e) =>
                          updateCustomization({
                            outfit: {
                              ...customization.outfit,
                              top: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bottomColor">Bottom Color</Label>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-10 h-10 rounded-md cursor-pointer border"
                        style={{ backgroundColor: customization.outfit.bottom }}
                      ></div>
                      <Input
                        id="bottomColor"
                        value={customization.outfit.bottom}
                        onChange={(e) =>
                          updateCustomization({
                            outfit: {
                              ...customization.outfit,
                              bottom: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shoesColor">Shoes Color</Label>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-10 h-10 rounded-md cursor-pointer border"
                        style={{ backgroundColor: customization.outfit.shoes }}
                      ></div>
                      <Input
                        id="shoesColor"
                        value={customization.outfit.shoes}
                        onChange={(e) =>
                          updateCustomization({
                            outfit: {
                              ...customization.outfit,
                              shoes: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() =>
                setActiveTab(
                  activeTab === "basic"
                    ? "body"
                    : activeTab === "body"
                      ? "outfit"
                      : "basic",
                )
              }
            >
              {activeTab === "outfit" ? "Back to Basic" : "Next"}
            </Button>
            <Button onClick={handleSave} className="bg-primary">
              <Save className="mr-2 h-4 w-4" />
              Save Character
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
