"use client"

import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface ModelSelectorProps {
  selectedModel: string
  onSelectModel: (model: string) => void
}

// Map custom names to actual OpenAI model IDs
const models = [
  {
    id: "gpt-4o",
    name: "Neuro Quantum",
    description: "Most powerful model for complex reasoning",
  },
  {
    id: "gpt-4o-mini",
    name: "Neuro Hyper",
    description: "Balanced performance and efficiency",
  },
  {
    id: "gpt-3.5-turbo",
    name: "Neuro Swift",
    description: "Fast responses for everyday tasks",
  },
]

export default function ModelSelector({ selectedModel, onSelectModel }: ModelSelectorProps) {
  const [open, setOpen] = useState(false)

  const selectedModelData = models.find((model) => model.id === selectedModel) || models[0]

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 h-9 border-border/30 bg-card/30 hover:bg-card/50"
        >
          <span className="hidden sm:inline">{selectedModelData.name}</span>
          <span className="sm:hidden">Model</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px]">
        {models.map((model) => (
          <DropdownMenuItem
            key={model.id}
            className={cn(
              "flex flex-col items-start py-2 px-3 cursor-pointer",
              selectedModel === model.id && "bg-primary/10",
            )}
            onClick={() => {
              onSelectModel(model.id)
              setOpen(false)
            }}
          >
            <div className="flex w-full justify-between items-center">
              <span className="font-medium">{model.name}</span>
              {selectedModel === model.id && <Check className="h-4 w-4 text-primary" />}
            </div>
            <span className="text-xs text-muted-foreground mt-0.5">{model.description}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
