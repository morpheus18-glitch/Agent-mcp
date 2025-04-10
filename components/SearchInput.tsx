"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"

interface SearchInputProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  className?: string
}

export default function SearchInput({ placeholder = "Search...", value, onChange, className = "" }: SearchInputProps) {
  const [inputValue, setInputValue] = useState(value)

  // Update local state when prop value changes
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Debounce the input value
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(inputValue)
    }, 300)

    return () => clearTimeout(timer)
  }, [inputValue, onChange])

  function handleClear() {
    setInputValue("")
    onChange("")
  }

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        className="w-full pl-8 pr-10"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      {inputValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
