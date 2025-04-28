"use client"

import type React from "react"

import { useRef } from "react"
import { Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

interface FileUploadButtonProps {
  onFileUpload: (files: File[]) => void
  disabled?: boolean
}

export default function FileUploadButton({ onFileUpload, disabled = false }: FileUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)

    // Check file size (limit to 5MB per file)
    const oversizedFiles = fileArray.filter((file) => file.size > 5 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      toast({
        title: "File too large",
        description: "Some files exceed the 5MB limit and were not uploaded.",
        variant: "destructive",
      })

      // Filter out oversized files
      const validFiles = fileArray.filter((file) => file.size <= 5 * 1024 * 1024)
      if (validFiles.length > 0) {
        onFileUpload(validFiles)
      }
    } else {
      onFileUpload(fileArray)
    }

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
        accept=".txt,.pdf,.doc,.docx,.csv,.json,.js,.py,.html,.css,.md,image/*"
      />
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary"
        onClick={handleClick}
        disabled={disabled}
      >
        <Paperclip className="h-4 w-4" />
        <span className="sr-only">Attach file</span>
      </Button>
    </>
  )
}
