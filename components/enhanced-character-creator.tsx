"use client"

import { useState, useEffect, useRef } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, useGLTF, Environment } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { SketchPicker } from "react-color"
import { useMediaQuery } from "@/hooks/use-mobile"
import {
  Loader2,
  Save,
  Undo,
  Redo,
  Download,
  Upload,
  RotateCw,
  Shuffle,
  Check,
  Zap,
  Camera,
  Maximize,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Character model component with enhanced features
function CharacterModel({ customization, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) {
  const group = useRef()
  const { scene, nodes, materials, animations } = useGLTF("/models/character-base.glb")
  const { camera } = useThree()

  // Apply customizations to the model
  useEffect(() => {
    if (!nodes || !materials) return

    // Apply skin color
    if (materials.Skin) {
      materials.Skin.color.set(customization.skinColor)
    }

    // Apply hair color
    if (materials.Hair) {
      materials.Hair.color.set(customization.hairColor)
    }

    // Apply eye color
    if (materials.Eyes) {
      materials.Eyes.color.set(customization.eyeColor)
    }

    // Apply clothing colors
    if (customization.outfit) {
      Object.entries(customization.outfit).forEach(([part, color]) => {
        if (materials[part]) {
          materials[part].color.set(color)
        }
      })
    }

    // Apply body morphs
    if (nodes.Body?.morphTargetDictionary && nodes.Body?.morphTargetInfluences) {
      const morphTargets = nodes.Body.morphTargetDictionary

      // Apply height
      if (morphTargets.height !== undefined) {
        nodes.Body.morphTargetInfluences[morphTargets.height] = customization.height
      }

      // Apply build/muscle
      if (morphTargets.build !== undefined) {
        nodes.Body.morphTargetInfluences[morphTargets.build] = customization.build
      }

      // Apply weight
      if (morphTargets.weight !== undefined) {
        nodes.Body.morphTargetInfluences[morphTargets.weight] = customization.weight
      }
    }

    // Apply face morphs
    if (nodes.Face?.morphTargetDictionary && nodes.Face?.morphTargetInfluences) {
      const morphTargets = nodes.Face.morphTargetDictionary

      // Apply smile
      if (morphTargets.smile !== undefined) {
        nodes.Face.morphTargetInfluences[morphTargets.smile] = customization.smile
      }

      // Apply eye size
      if (morphTargets.eyeSize !== undefined) {
        nodes.Face.morphTargetInfluences[morphTargets.eyeSize] = customization.eyeSize
      }

      // Apply jaw width
      if (morphTargets.jawWidth !== undefined) {
        nodes.Face.morphTargetInfluences[morphTargets.jawWidth] = customization.jawWidth
      }

      // Apply nose size
      if (morphTargets.noseSize !== undefined) {
        nodes.Face.morphTargetInfluences[morphTargets.noseSize] = customization.noseSize
      }
    }
  }, [customization, materials, nodes])

  return (
    <group ref={group} position={position} rotation={rotation} scale={[scale, scale, scale]}>
      {/* Base character meshes */}
      <mesh
        geometry={nodes.Body.geometry}
        material={materials.Skin}
        morphTargetDictionary={nodes.Body.morphTargetDictionary}
        morphTargetInfluences={nodes.Body.morphTargetInfluences}
        castShadow
      />
      <mesh
        geometry={nodes.Face.geometry}
        material={materials.Skin}
        morphTargetDictionary={nodes.Face.morphTargetDictionary}
        morphTargetInfluences={nodes.Face.morphTargetInfluences}
        castShadow
      />

      {/* Hair based on selected style */}
      {customization.hairStyle && (
        <group>
          <mesh
            geometry={nodes[`Hair_${customization.hairStyle}`]?.geometry || nodes.Hair_Default.geometry}
            material={materials.Hair}
            castShadow
          />
        </group>
      )}

      {/* Eyes */}
      <mesh geometry={nodes.Eyes.geometry} material={materials.Eyes} />

      {/* Outfit based on selected style */}
      {customization.outfitStyle && (
        <group>
          <mesh
            geometry={nodes[`Outfit_${customization.outfitStyle}`]?.geometry || nodes.Outfit_Default.geometry}
            material={materials.Outfit}
            castShadow
          />
        </group>
      )}

      {/* Accessories */}
      {customization.accessories &&
        customization.accessories.map((accessory) => (
          <group key={accessory.id}>
            <mesh
              geometry={nodes[accessory.id]?.geometry}
              material={materials[accessory.material] || materials.Accessory}
              position={accessory.position || [0, 0, 0]}
              rotation={accessory.rotation || [0, 0, 0]}
              scale={accessory.scale || [1, 1, 1]}
              castShadow
            />
          </group>
        ))}
    </group>
  )
}

// Turntable animation for 360 view
function Turntable({ children, speed = 0.005, autoRotate = false, enabled = true }) {
  const group = useRef()

  useFrame(() => {
    if (group.current && autoRotate && enabled) {
      group.current.rotation.y += speed
    }
  })

  return <group ref={group}>{children}</group>
}

// Camera controller
function CameraController({ zoom, setZoom, target, setTarget, position, setPosition }) {
  const { camera, gl } = useThree()
  const controlsRef = useRef()

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.target.set(...target)
      controlsRef.current.update()
    }
  }, [target])

  useEffect(() => {
    if (camera) {
      camera.position.set(...position)
      camera.updateProjectionMatrix()
    }
  }, [position, camera])

  return (
    <OrbitControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      enableZoom={true}
      enablePan={true}
      minDistance={1}
      maxDistance={10}
      minPolarAngle={0}
      maxPolarAngle={Math.PI / 1.5}
      onChange={(e) => {
        setPosition([camera.position.x, camera.position.y, camera.position.z])
        setTarget([controlsRef.current.target.x, controlsRef.current.target.y, controlsRef.current.target.z])
      }}
    />
  )
}

// Preset template component
function PresetTemplate({ preset, onSelect, isSelected }) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md overflow-hidden",
        isSelected ? "ring-2 ring-primary" : "",
      )}
      onClick={onSelect}
    >
      <div className="h-40 relative">
        <Canvas>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <CharacterModel customization={preset.customization} position={[0, -1, 0]} scale={0.8} />
          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
      </div>
      <CardContent className="p-3">
        <h3 className="font-medium text-sm">{preset.name}</h3>
        <p className="text-xs text-muted-foreground">{preset.description}</p>
      </CardContent>
    </Card>
  )
}

// Color picker component
function ColorPicker({ color, onChange, label }) {
  const [showPicker, setShowPicker] = useState(false)

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <div
          className="w-10 h-10 rounded-md cursor-pointer border"
          style={{ backgroundColor: color }}
          onClick={() => setShowPicker(!showPicker)}
        />
        <Input value={color} onChange={(e) => onChange(e.target.value)} className="flex-1" />
      </div>
      {showPicker && (
        <div className="absolute z-10 mt-1">
          <div className="fixed inset-0" onClick={() => setShowPicker(false)} />
          <SketchPicker color={color} onChange={(color) => onChange(color.hex)} />
        </div>
      )}
    </div>
  )
}

// Accessory item component
function AccessoryItem({ accessory, isSelected, onToggle }) {
  return (
    <div
      className={cn(
        "flex items-center p-2 rounded-md cursor-pointer",
        isSelected ? "bg-primary/20 border border-primary" : "bg-muted hover:bg-muted/80",
      )}
      onClick={onToggle}
    >
      <div className="w-10 h-10 bg-background rounded-md flex items-center justify-center mr-3">{accessory.icon}</div>
      <div className="flex-1">
        <h4 className="text-sm font-medium">{accessory.name}</h4>
        <p className="text-xs text-muted-foreground">{accessory.description}</p>
      </div>
      <div className="ml-2">{isSelected ? <Check className="h-5 w-5 text-primary" /> : null}</div>
    </div>
  )
}

// Outfit style component
function OutfitStyle({ style, isSelected, onClick, color }) {
  return (
    <div
      className={cn(
        "cursor-pointer p-2 rounded-md",
        isSelected ? "bg-primary/20 border border-primary" : "bg-muted hover:bg-muted/80",
      )}
      onClick={onClick}
    >
      <div className="w-24 h-24 relative">
        <Canvas>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <mesh position={[0, 0, 0]} scale={[0.5, 0.5, 0.5]}>
            <boxGeometry args={[1, 2, 0.5]} />
            <meshStandardMaterial color={color || "#4a6fa5"} />
          </mesh>
          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
      </div>
      <p className="text-center text-sm mt-1">{style.name}</p>
    </div>
  )
}

// Main enhanced character creator component
export default function EnhancedCharacterCreator({ onSave, initialCustomization = null }) {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("presets")
  const [autoRotate, setAutoRotate] = useState(false)
  const [showWireframe, setShowWireframe] = useState(false)
  const [cameraPosition, setCameraPosition] = useState([0, 1.5, 4])
  const [cameraTarget, setCameraTarget] = useState([0, 0, 0])
  const [cameraZoom, setCameraZoom] = useState(1)
  const [viewMode, setViewMode] = useState("full") // full, head, body, outfit

  // Character customization state with expanded options
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

    // Outfit colors (expanded)
    outfit: {
      top: "#4a6fa5",
      bottom: "#2d3748",
      shoes: "#1a202c",
      accessories: "#d69e2e",
    },

    // Accessories (expanded with properties)
    accessories: [],
  })

  // History for undo/redo
  const [history, setHistory] = useState([customization])
  const [historyIndex, setHistoryIndex] = useState(0)

  // Available options (expanded)
  const hairStyles = [
    { id: "short", name: "Short" },
    { id: "long", name: "Long" },
    { id: "curly", name: "Curly" },
    { id: "wavy", name: "Wavy" },
    { id: "bald", name: "Bald" },
    { id: "ponytail", name: "Ponytail" },
    { id: "bun", name: "Bun" },
    { id: "braided", name: "Braided" },
    { id: "mohawk", name: "Mohawk" },
    { id: "afro", name: "Afro" },
  ]

  const outfitStyles = [
    { id: "casual", name: "Casual" },
    { id: "formal", name: "Formal" },
    { id: "business", name: "Business" },
    { id: "sporty", name: "Sporty" },
    { id: "fantasy", name: "Fantasy" },
    { id: "sci_fi", name: "Sci-Fi" },
    { id: "medieval", name: "Medieval" },
    { id: "steampunk", name: "Steampunk" },
    { id: "cyberpunk", name: "Cyberpunk" },
    { id: "military", name: "Military" },
  ]

  const accessoryOptions = [
    {
      id: "glasses",
      name: "Glasses",
      description: "Various eyewear styles",
      material: "Accessory",
      icon: <Eye className="h-6 w-6" />,
      position: [0, 0, 0],
      variants: [
        { id: "glasses_round", name: "Round" },
        { id: "glasses_square", name: "Square" },
        { id: "glasses_aviator", name: "Aviator" },
        { id: "glasses_cat_eye", name: "Cat Eye" },
      ],
    },
    {
      id: "hat",
      name: "Hat",
      description: "Headwear collection",
      material: "Accessory",
      icon: <ChevronLeft className="h-6 w-6 rotate-90" />,
      position: [0, 0.2, 0],
      variants: [
        { id: "hat_beanie", name: "Beanie" },
        { id: "hat_cap", name: "Cap" },
        { id: "hat_cowboy", name: "Cowboy" },
        { id: "hat_top", name: "Top Hat" },
        { id: "hat_fedora", name: "Fedora" },
      ],
    },
    {
      id: "earrings",
      name: "Earrings",
      description: "Ear accessories",
      material: "Jewelry",
      icon: <Circle className="h-6 w-6" />,
      position: [0, 0, 0],
      variants: [
        { id: "earrings_stud", name: "Stud" },
        { id: "earrings_hoop", name: "Hoop" },
        { id: "earrings_dangle", name: "Dangle" },
      ],
    },
    {
      id: "necklace",
      name: "Necklace",
      description: "Neck jewelry",
      material: "Jewelry",
      icon: <Circle className="h-6 w-6" />,
      position: [0, -0.2, 0],
      variants: [
        { id: "necklace_pendant", name: "Pendant" },
        { id: "necklace_chain", name: "Chain" },
        { id: "necklace_choker", name: "Choker" },
      ],
    },
    {
      id: "watch",
      name: "Watch",
      description: "Wrist accessories",
      material: "Accessory",
      icon: <Circle className="h-6 w-6" />,
      position: [0.3, -0.5, 0],
      variants: [
        { id: "watch_smart", name: "Smart Watch" },
        { id: "watch_luxury", name: "Luxury" },
        { id: "watch_sport", name: "Sport" },
      ],
    },
    {
      id: "bracelet",
      name: "Bracelet",
      description: "Wrist jewelry",
      material: "Jewelry",
      icon: <Circle className="h-6 w-6" />,
      position: [-0.3, -0.5, 0],
      variants: [
        { id: "bracelet_charm", name: "Charm" },
        { id: "bracelet_bangle", name: "Bangle" },
        { id: "bracelet_cuff", name: "Cuff" },
      ],
    },
    {
      id: "shoes",
      name: "Shoes",
      description: "Footwear options",
      material: "Accessory",
      icon: <ChevronRight className="h-6 w-6 -rotate-90" />,
      position: [0, -1, 0],
      variants: [
        { id: "shoes_sneakers", name: "Sneakers" },
        { id: "shoes_boots", name: "Boots" },
        { id: "shoes_dress", name: "Dress Shoes" },
        { id: "shoes_sandals", name: "Sandals" },
        { id: "shoes_heels", name: "Heels" },
      ],
    },
    {
      id: "tattoo",
      name: "Tattoo",
      description: "Body art",
      material: "Skin",
      icon: <Zap className="h-6 w-6" />,
      position: [0, 0, 0],
      variants: [
        { id: "tattoo_arm", name: "Arm Sleeve" },
        { id: "tattoo_back", name: "Back" },
        { id: "tattoo_chest", name: "Chest" },
        { id: "tattoo_face", name: "Face" },
      ],
    },
  ]

  // Character presets
  const characterPresets = [
    {
      id: "business_professional",
      name: "Business Professional",
      description: "Formal business attire with a professional appearance",
      customization: {
        hairStyle: "short",
        outfitStyle: "business",
        skinColor: "#e0b69e",
        hairColor: "#3d2314",
        eyeColor: "#2f5d8a",
        outfit: {
          top: "#1a365d",
          bottom: "#2d3748",
          shoes: "#1a202c",
        },
        accessories: [
          { id: "glasses", material: "Accessory", position: [0, 0, 0] },
          { id: "watch", material: "Accessory", position: [0.3, -0.5, 0] },
        ],
        height: 0.6,
        build: 0.5,
        weight: 0.4,
        smile: 0.3,
      },
    },
    {
      id: "casual_trendy",
      name: "Casual Trendy",
      description: "Modern casual look with stylish accessories",
      customization: {
        hairStyle: "wavy",
        outfitStyle: "casual",
        skinColor: "#c4a484",
        hairColor: "#1a1a1a",
        eyeColor: "#3e5c76",
        outfit: {
          top: "#718096",
          bottom: "#2d3748",
          shoes: "#e53e3e",
        },
        accessories: [{ id: "necklace", material: "Jewelry", position: [0, -0.2, 0] }],
        height: 0.5,
        build: 0.4,
        weight: 0.4,
        smile: 0.7,
      },
    },
    {
      id: "athletic",
      name: "Athletic",
      description: "Sporty build with athletic wear",
      customization: {
        hairStyle: "short",
        outfitStyle: "sporty",
        skinColor: "#d2b48c",
        hairColor: "#8b4513",
        eyeColor: "#228b22",
        outfit: {
          top: "#38a169",
          bottom: "#2d3748",
          shoes: "#e53e3e",
        },
        accessories: [{ id: "watch", material: "Accessory", position: [0.3, -0.5, 0] }],
        height: 0.7,
        build: 0.8,
        weight: 0.3,
        smile: 0.6,
      },
    },
    {
      id: "sci_fi_agent",
      name: "Sci-Fi Agent",
      description: "Futuristic agent with high-tech gear",
      customization: {
        hairStyle: "mohawk",
        outfitStyle: "sci_fi",
        skinColor: "#b0c4de",
        hairColor: "#4b0082",
        eyeColor: "#00ffff",
        outfit: {
          top: "#2c3e50",
          bottom: "#34495e",
          shoes: "#7f8c8d",
        },
        accessories: [
          { id: "glasses", material: "Accessory", position: [0, 0, 0] },
          { id: "watch", material: "Accessory", position: [0.3, -0.5, 0] },
        ],
        height: 0.6,
        build: 0.7,
        weight: 0.3,
        smile: 0.2,
      },
    },
    {
      id: "fantasy_character",
      name: "Fantasy Character",
      description: "Mystical character with fantasy elements",
      customization: {
        hairStyle: "long",
        outfitStyle: "fantasy",
        skinColor: "#f5deb3",
        hairColor: "#daa520",
        eyeColor: "#9370db",
        outfit: {
          top: "#4b0082",
          bottom: "#800080",
          shoes: "#8b4513",
        },
        accessories: [
          { id: "necklace", material: "Jewelry", position: [0, -0.2, 0] },
          { id: "earrings", material: "Jewelry", position: [0, 0, 0] },
        ],
        height: 0.6,
        build: 0.4,
        weight: 0.4,
        smile: 0.4,
      },
    },
    {
      id: "cyberpunk",
      name: "Cyberpunk",
      description: "Edgy cyberpunk style with neon accents",
      customization: {
        hairStyle: "mohawk",
        outfitStyle: "cyberpunk",
        skinColor: "#e0b69e",
        hairColor: "#ff00ff",
        eyeColor: "#00ffff",
        outfit: {
          top: "#000000",
          bottom: "#1a1a1a",
          shoes: "#333333",
        },
        accessories: [
          { id: "glasses", material: "Accessory", position: [0, 0, 0] },
          { id: "tattoo", material: "Skin", position: [0, 0, 0] },
        ],
        height: 0.5,
        build: 0.6,
        weight: 0.3,
        smile: 0.2,
      },
    },
  ]

  // Initialize with initial customization if provided
  useEffect(() => {
    if (initialCustomization) {
      setCustomization(initialCustomization)
      setHistory([initialCustomization])
      setHistoryIndex(0)
    }

    // Simulate loading assets
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [initialCustomization])

  // Update customization and add to history
  const updateCustomization = (updates) => {
    const newCustomization = { ...customization, ...updates }

    // Add to history, removing any future states if we're not at the end
    const newHistory = history.slice(0, historyIndex + 1).concat(newCustomization)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)

    setCustomization(newCustomization)
  }

  // Undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setCustomization(history[historyIndex - 1])
    }
  }

  // Redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setCustomization(history[historyIndex + 1])
    }
  }

  // Save character
  const handleSave = () => {
    if (onSave) {
      onSave(customization)
    }

    // Save to local storage
    localStorage.setItem("characterCustomization", JSON.stringify(customization))

    alert("Character saved successfully!")
  }

  // Export character
  const handleExport = () => {
    const dataStr = JSON.stringify(customization, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    const exportFileDefaultName = `${customization.name.toLowerCase().replace(/\s+/g, "-")}-character.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  // Import character
  const handleImport = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedCustomization = JSON.parse(e.target.result)
        updateCustomization(importedCustomization)
      } catch (error) {
        alert("Failed to import character: Invalid file format")
      }
    }
    reader.readAsText(file)
  }

  // Toggle accessory
  const toggleAccessory = (accessory) => {
    const accessories = [...customization.accessories]
    const index = accessories.findIndex((a) => a.id === accessory.id)

    if (index === -1) {
      accessories.push({
        id: accessory.id,
        material: accessory.material,
        position: accessory.position,
        variant: accessory.variants?.[0]?.id || null,
      })
    } else {
      accessories.splice(index, 1)
    }

    updateCustomization({ accessories })
  }

  // Update accessory variant
  const updateAccessoryVariant = (accessoryId, variantId) => {
    const accessories = [...customization.accessories]
    const index = accessories.findIndex((a) => a.id === accessoryId)

    if (index !== -1) {
      accessories[index] = {
        ...accessories[index],
        variant: variantId,
      }

      updateCustomization({ accessories })
    }
  }

  // Update outfit color
  const updateOutfitColor = (part, color) => {
    const outfit = { ...customization.outfit, [part]: color }
    updateCustomization({ outfit })
  }

  // Apply preset
  const applyPreset = (preset) => {
    updateCustomization(preset.customization)
  }

  // Randomize character
  const randomizeCharacter = () => {
    const randomPreset = characterPresets[Math.floor(Math.random() * characterPresets.length)]
    applyPreset(randomPreset)

    // Add some randomization to features
    const randomFeatures = {
      height: Math.random(),
      build: Math.random(),
      weight: Math.random(),
      smile: Math.random(),
      eyeSize: Math.random(),
      jawWidth: Math.random(),
      noseSize: Math.random(),
      skinColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      hairColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      eyeColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    }

    updateCustomization(randomFeatures)
  }

  // Reset to defaults
  const resetCharacter = () => {
    const defaultCustomization = {
      name: "Agent",
      skinColor: "#e0b69e",
      hairColor: "#3d2314",
      eyeColor: "#2f5d8a",
      height: 0.5,
      build: 0.5,
      weight: 0.5,
      smile: 0.5,
      eyeSize: 0.5,
      jawWidth: 0.5,
      noseSize: 0.5,
      hairStyle: "short",
      outfitStyle: "casual",
      outfit: {
        top: "#4a6fa5",
        bottom: "#2d3748",
        shoes: "#1a202c",
        accessories: "#d69e2e",
      },
      accessories: [],
    }

    updateCustomization(defaultCustomization)
  }

  // Take screenshot
  const takeScreenshot = () => {
    // In a real implementation, this would capture the canvas and save as an image
    alert("Screenshot functionality would be implemented here")
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-medium">Loading Character Creator...</h2>
        <p className="text-muted-foreground">Preparing 3D assets and tools</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* 3D Character Preview */}
      <div className="flex-1">
        <Card className="h-[600px]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Character Preview</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={autoRotate ? "bg-primary/20" : ""}
                >
                  <RotateCw className="h-4 w-4 mr-2" />
                  {autoRotate ? "Stop Rotation" : "Rotate 360°"}
                </Button>
                <Button variant="outline" size="sm" onClick={takeScreenshot}>
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription>View your character from all angles</CardDescription>
          </CardHeader>
          <CardContent className="p-0 h-[500px] relative">
            <div className="absolute top-2 right-2 z-10 flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWireframe(!showWireframe)}
                className={showWireframe ? "bg-primary/20" : ""}
              >
                {showWireframe ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCameraPosition([0, 1.5, 4])
                  setCameraTarget([0, 0, 0])
                }}
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>

            <div className="absolute bottom-2 left-2 z-10 flex gap-2">
              <Button
                variant={viewMode === "full" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("full")}
              >
                Full
              </Button>
              <Button
                variant={viewMode === "head" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setViewMode("head")
                  setCameraPosition([0, 2, 1.5])
                  setCameraTarget([0, 1.8, 0])
                }}
              >
                Head
              </Button>
              <Button
                variant={viewMode === "body" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setViewMode("body")
                  setCameraPosition([0, 0.5, 2])
                  setCameraTarget([0, 0, 0])
                }}
              >
                Body
              </Button>
              <Button
                variant={viewMode === "outfit" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setViewMode("outfit")
                  setCameraPosition([0, 0, 2])
                  setCameraTarget([0, -0.5, 0])
                }}
              >
                Outfit
              </Button>
            </div>

            <Canvas shadows camera={{ position: [0, 1.5, 4], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={1} castShadow />
              <Turntable autoRotate={autoRotate} enabled={true}>
                <CharacterModel customization={customization} />
              </Turntable>
              <Environment preset="apartment" />
              <CameraController
                zoom={cameraZoom}
                setZoom={setCameraZoom}
                target={cameraTarget}
                setTarget={setCameraTarget}
                position={cameraPosition}
                setPosition={setCameraPosition}
              />
              {showWireframe && <gridHelper args={[10, 10, "#444444", "#222222"]} />}
            </Canvas>
          </CardContent>
        </Card>
      </div>

      {/* Customization Controls */}
      <div className="w-full lg:w-96">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Customization</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handleUndo} disabled={historyIndex === 0}>
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
                <Button variant="outline" size="icon" onClick={randomizeCharacter}>
                  <Shuffle className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription>Customize your character's appearance</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="presets">Presets</TabsTrigger>
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="body">Body</TabsTrigger>
                <TabsTrigger value="outfit">Outfit</TabsTrigger>
                <TabsTrigger value="accessories">Extras</TabsTrigger>
              </TabsList>

              <div className="p-4">
                {/* Presets Tab */}
                <TabsContent value="presets" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Character Presets</h3>
                    <Button variant="outline" size="sm" onClick={resetCharacter}>
                      Reset
                    </Button>
                  </div>

                  <ScrollArea className="h-[400px] pr-4">
                    <div className="grid grid-cols-2 gap-4">
                      {characterPresets.map((preset) => (
                        <PresetTemplate
                          key={preset.id}
                          preset={preset}
                          isSelected={false}
                          onSelect={() => applyPreset(preset)}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* Basic Tab */}
                <TabsContent value="basic" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Character Name</Label>
                    <Input
                      id="name"
                      value={customization.name}
                      onChange={(e) => updateCustomization({ name: e.target.value })}
                    />
                  </div>

                  <ColorPicker
                    label="Skin Color"
                    color={customization.skinColor}
                    onChange={(color) => updateCustomization({ skinColor: color })}
                  />

                  <ColorPicker
                    label="Eye Color"
                    color={customization.eyeColor}
                    onChange={(color) => updateCustomization({ eyeColor: color })}
                  />

                  <div className="space-y-2">
                    <Label>Hair Style</Label>
                    <Select
                      value={customization.hairStyle}
                      onValueChange={(value) => updateCustomization({ hairStyle: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select hair style" />
                      </SelectTrigger>
                      <SelectContent>
                        {hairStyles.map((style) => (
                          <SelectItem key={style.id} value={style.id}>
                            {style.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <ColorPicker
                    label="Hair Color"
                    color={customization.hairColor}
                    onChange={(color) => updateCustomization({ hairColor: color })}
                  />
                </TabsContent>

                {/* Body Tab */}
                <TabsContent value="body" className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="height">Height</Label>
                      <span className="text-sm text-muted-foreground">{Math.round(customization.height * 100)}%</span>
                    </div>
                    <Slider
                      id="height"
                      min={0}
                      max={1}
                      step={0.01}
                      value={[customization.height]}
                      onValueChange={([value]) => updateCustomization({ height: value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="build">Muscle Build</Label>
                      <span className="text-sm text-muted-foreground">{Math.round(customization.build * 100)}%</span>
                    </div>
                    <Slider
                      id="build"
                      min={0}
                      max={1}
                      step={0.01}
                      value={[customization.build]}
                      onValueChange={([value]) => updateCustomization({ build: value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="weight">Weight</Label>
                      <span className="text-sm text-muted-foreground">{Math.round(customization.weight * 100)}%</span>
                    </div>
                    <Slider
                      id="weight"
                      min={0}
                      max={1}
                      step={0.01}
                      value={[customization.weight]}
                      onValueChange={([value]) => updateCustomization({ weight: value })}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="smile">Smile</Label>
                      <span className="text-sm text-muted-foreground">{Math.round(customization.smile * 100)}%</span>
                    </div>
                    <Slider
                      id="smile"
                      min={0}
                      max={1}
                      step={0.01}
                      value={[customization.smile]}
                      onValueChange={([value]) => updateCustomization({ smile: value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="eyeSize">Eye Size</Label>
                      <span className="text-sm text-muted-foreground">{Math.round(customization.eyeSize * 100)}%</span>
                    </div>
                    <Slider
                      id="eyeSize"
                      min={0}
                      max={1}
                      step={0.01}
                      value={[customization.eyeSize]}
                      onValueChange={([value]) => updateCustomization({ eyeSize: value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="jawWidth">Jaw Width</Label>
                      <span className="text-sm text-muted-foreground">{Math.round(customization.jawWidth * 100)}%</span>
                    </div>
                    <Slider
                      id="jawWidth"
                      min={0}
                      max={1}
                      step={0.01}
                      value={[customization.jawWidth]}
                      onValueChange={([value]) => updateCustomization({ jawWidth: value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="noseSize">Nose Size</Label>
                      <span className="text-sm text-muted-foreground">{Math.round(customization.noseSize * 100)}%</span>
                    </div>
                    <Slider
                      id="noseSize"
                      min={0}
                      max={1}
                      step={0.01}
                      value={[customization.noseSize]}
                      onValueChange={([value]) => updateCustomization({ noseSize: value })}
                    />
                  </div>
                </TabsContent>

                {/* Outfit Tab */}
                <TabsContent value="outfit" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Outfit Style</Label>
                    <Select
                      value={customization.outfitStyle}
                      onValueChange={(value) => updateCustomization({ outfitStyle: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select outfit style" />
                      </SelectTrigger>
                      <SelectContent>
                        {outfitStyles.map((style) => (
                          <SelectItem key={style.id} value={style.id}>
                            {style.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Outfit Colors</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <ColorPicker
                        label="Top"
                        color={customization.outfit.top}
                        onChange={(color) => updateOutfitColor("top", color)}
                      />

                      <ColorPicker
                        label="Bottom"
                        color={customization.outfit.bottom}
                        onChange={(color) => updateOutfitColor("bottom", color)}
                      />

                      <ColorPicker
                        label="Shoes"
                        color={customization.outfit.shoes}
                        onChange={(color) => updateOutfitColor("shoes", color)}
                      />

                      <ColorPicker
                        label="Accessories"
                        color={customization.outfit.accessories}
                        onChange={(color) => updateOutfitColor("accessories", color)}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Accessories Tab */}
                <TabsContent value="accessories" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Accessories</Label>
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="space-y-2">
                        {accessoryOptions.map((accessory) => {
                          const isSelected = customization.accessories.some((a) => a.id === accessory.id)
                          return (
                            <div key={accessory.id} className="space-y-2">
                              <AccessoryItem
                                accessory={accessory}
                                isSelected={isSelected}
                                onToggle={() => toggleAccessory(accessory)}
                              />

                              {isSelected && accessory.variants && (
                                <div className="ml-12 mt-2">
                                  <Select
                                    value={customization.accessories.find((a) => a.id === accessory.id)?.variant || ""}
                                    onValueChange={(value) => updateAccessoryVariant(accessory.id, value)}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Select variant" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {accessory.variants.map((variant) => (
                                        <SelectItem key={variant.id} value={variant.id}>
                                          {variant.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="import">Import/Export</Label>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </Button>
                      <div className="relative flex-1">
                        <Button variant="outline" className="w-full">
                          <Upload className="mr-2 h-4 w-4" />
                          Import
                        </Button>
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImport}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
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
                  activeTab === "presets"
                    ? "basic"
                    : activeTab === "basic"
                      ? "body"
                      : activeTab === "body"
                        ? "outfit"
                        : activeTab === "outfit"
                          ? "accessories"
                          : "presets",
                )
              }
            >
              {activeTab === "accessories" ? "Back to Presets" : "Next"}
            </Button>
            <Button onClick={handleSave} className="bg-primary">
              <Save className="mr-2 h-4 w-4" />
              Save Character
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

// Helper component for Circle icon
function Circle({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  )
}
